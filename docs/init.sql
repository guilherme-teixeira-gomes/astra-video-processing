-- ASTRA
-- Script de criação do banco de dados (PostgreSQL)
-- OBS: o API Service usa TypeORM com synchronize=true, que cria as tabelas
-- automaticamente. Este script documenta o schema e permite criação manual.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuários (autenticação)
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(120) UNIQUE NOT NULL,
  name        VARCHAR(120) NOT NULL,
  password    VARCHAR(200) NOT NULL,  -- hash bcrypt
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Vídeos (fila de processamento e status)
CREATE TABLE IF NOT EXISTS videos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "originalName" VARCHAR(255) NOT NULL,
  "storagePath"  VARCHAR(500) NOT NULL,
  status         VARCHAR(30) NOT NULL DEFAULT 'RECEBIDO',
  -- RECEBIDO -> NA_FILA -> PROCESSANDO -> CONCLUIDO | ERRO
  "zipPath"      VARCHAR(500),
  "frameCount"   INT,
  "errorMessage" TEXT,
  "createdAt"    TIMESTAMP DEFAULT now(),
  "updatedAt"    TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_user ON videos("userId");
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
