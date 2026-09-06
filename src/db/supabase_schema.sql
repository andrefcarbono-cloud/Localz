-- ==============================================================================
-- LOCALZ — ESQUEMA POSTGRESQL / SUPABASE PARA PRODUÇÃO
-- Conforme especificação técnica do Prompt Mestre:
-- Autenticação, RLS, Índices Geográficos, Farmácias de Plantão, Contribuições
-- ==============================================================================

-- 1. Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Tabela de Cidades e Configurações Municipais de Plantão
CREATE TABLE IF NOT EXISTS public.cities (
    id TEXT PRIMARY KEY, -- ex: 'sao-lourenco-mg'
    name TEXT NOT NULL,
    state VARCHAR(2) NOT NULL,
    state_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    population INTEGER,
    duty_model TEXT NOT NULL CHECK (duty_model IN ('rotation', 'permanent_24h', 'multi_24h', 'scheduled', 'none_defined')),
    duty_model_description TEXT,
    duty_source_official TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Perfis de Usuários (Integrado ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    avatar_url TEXT,
    city_default TEXT REFERENCES public.cities(id),
    reputation_score NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Estabelecimentos, Lugares, Serviços e Eventos
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('business', 'place', 'event', 'service')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    address TEXT NOT NULL,
    neighborhood TEXT,
    city_id TEXT NOT NULL REFERENCES public.cities(id),
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    phone TEXT,
    whatsapp TEXT,
    website TEXT,
    instagram TEXT,
    photos TEXT[] DEFAULT '{}',
    is_sponsored BOOLEAN DEFAULT FALSE,
    verification_status TEXT NOT NULL DEFAULT 'community' CHECK (verification_status IN ('community', 'claimed', 'verified', 'pending')),
    localz_score NUMERIC(3,1) DEFAULT 8.0 CHECK (localz_score >= 0 AND localz_score <= 10.0),
    review_count INTEGER DEFAULT 0,
    
    -- Específicos para Comércio / Farmácia
    is_24h BOOLEAN DEFAULT FALSE,
    is_pharmacy BOOLEAN DEFAULT FALSE,
    price_range VARCHAR(4) CHECK (price_range IN ('R$', 'R$$', 'R$$$', 'R$$$$')),
    opening_hours JSONB,
    amenities TEXT[] DEFAULT '{}',
    
    -- Específicos para Eventos
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    organizer_name TEXT,
    organizer_score NUMERIC(3,1),
    is_free BOOLEAN DEFAULT TRUE,
    ticket_price TEXT,
    ticket_link TEXT,
    recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly', 'annual', 'specific_days', 'traditional_edition')),
    event_status TEXT DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'happening_now', 'finished', 'cancelled')),
    
    author_id UUID REFERENCES public.profiles(id),
    owner_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para manter PostGIS Geometry sincronizado com lat/lng
CREATE OR REPLACE FUNCTION public.sync_item_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_item_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.items
FOR EACH ROW EXECUTE FUNCTION public.sync_item_geom();

-- 5. Escalas de Plantão Farmacêutico (Utilidade Pública Municipal)
CREATE TABLE IF NOT EXISTS public.pharmacy_duty_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id TEXT NOT NULL REFERENCES public.cities(id),
    pharmacy_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    pharmacy_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    special_schedule_text TEXT NOT NULL,
    source TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('official_decree', 'commercial_assoc', 'pharmacy_union', 'citizen_confirmed')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'under_review', 'expired')),
    last_confirmed_date DATE NOT NULL,
    notes TEXT,
    confirmed_by_admin_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Avaliações Dimensionais
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_rating NUMERIC(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
    dimensions JSONB NOT NULL, -- ex: [{"key": "comida", "rating": 5}, {"key": "atendimento", "rating": 4}]
    comment TEXT,
    verified_visit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Contribuições Colaborativas da Comunidade
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('new_item', 'edit_item', 'new_duty_shift', 'report_issue')),
    item_type TEXT,
    target_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    target_item_title TEXT,
    city_id TEXT NOT NULL REFERENCES public.cities(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Favoritos do Usuário
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, item_id)
);

-- 9. Índices para Pesquisa Rápida e Consultas Espaciais
CREATE INDEX IF NOT EXISTS idx_items_city ON public.items(city_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_geom ON public.items USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_pharmacy_duty_dates ON public.pharmacy_duty_shifts(city_id, start_datetime, end_datetime);

-- 10. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_duty_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Leitura pública para Cidades, Items confirmados e Plantões
CREATE POLICY "Cidades são públicas para leitura" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Itens verificados são públicos para leitura" ON public.items FOR SELECT USING (verification_status != 'pending');
CREATE POLICY "Plantões de farmácia são públicos para leitura" ON public.pharmacy_duty_shifts FOR SELECT USING (true);
CREATE POLICY "Avaliações são públicas para leitura" ON public.reviews FOR SELECT USING (true);

-- Usuários autenticados podem inserir contribuições e avaliações
CREATE POLICY "Usuários autenticados podem criar contribuições" ON public.contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam seus próprios favoritos" ON public.favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar avaliações" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Somente administradores e moderadores podem atualizar escalas e aprovar contribuições
CREATE POLICY "Admins podem gerenciar escalas de farmácia" ON public.pharmacy_duty_shifts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Admins podem moderar contribuições" ON public.contributions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
