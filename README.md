# Digital Signature System using Hybrid RSA and EdDSA

<p align="center">
  <b>Penerapan Algoritma RSA dan EdDSA dengan Metode Hybrid-Signature untuk Keamanan Dokumen Digital Perusahaan</b>
</p>

<p align="center">
  Sistem keamanan dokumen digital berbasis web yang mengimplementasikan kombinasi algoritma RSA dan EdDSA sebagai hybrid digital signature dengan penyimpanan signature pada metadata dokumen.
</p>

---

## Overview

Project ini merupakan implementasi sistem keamanan dokumen digital yang dikembangkan sebagai bagian dari penelitian tugas akhir dengan judul:

> **"Penerapan Algoritma RSA dan EdDSA dengan Metode Hybrid-Signature untuk Keamanan Dokumen Digital Perusahaan"**

Sistem ini bertujuan untuk menyediakan mekanisme autentikasi dan integritas dokumen digital menggunakan pendekatan **hybrid signature** dengan menggabungkan dua algoritma digital signature:

- **RSA**
- **EdDSA (Ed25519)**

Berbeda dengan pendekatan digital signature konvensional yang melakukan modifikasi langsung terhadap struktur fisik dokumen seperti implementasi PAdES atau XAdES, sistem ini menggunakan pendekatan **metadata-based signature**, yaitu menyimpan informasi kriptografi pada metadata dokumen sehingga konten asli dokumen tetap tidak berubah.

---

# Features

## User Management

- Registrasi dan autentikasi pengguna.
- Pengelolaan identitas pengguna.
- Dukungan satu pengguna memiliki banyak pasangan key.

---

## Key Management

Sistem menerapkan konsep **one-to-many key relationship**, dimana satu user dapat memiliki beberapa key untuk kebutuhan penandatanganan berbeda.

Setiap key memiliki:

- RSA Public Key
- EdDSA Public Key
- Key identifier
- Status pencabutan key

Private key:

- Tidak disimpan pada server.
- Dibuat dan dimiliki oleh user.
- Digunakan ketika proses signing dokumen berlangsung.

---

## Document Management

Sistem mendukung dokumen:

- PDF
- DOCX
- XLSX

Setiap dokumen akan memiliki:

- Document identifier
- Content-based document hash
- Metadata signature
- Riwayat penandatanganan

---

# Hybrid Signature Architecture

Sistem menggunakan kombinasi dua algoritma digital signature:

```
              Document
                 |
                 |
      Content-based Hashing
                 |
         document_hash
                 |
    +------------+-------------+
    |                          |
   RSA                        EdDSA
    |                          |
RSA Signature              EdDSA Signature
    |                          |
    +------------+-------------+
                 |
          Hybrid Signature
                 |
        Document Metadata
```

---

# Signing Flow

Proses penandatanganan dokumen:

1. User mengunggah dokumen.
2. Sistem melakukan ekstraksi konten dokumen.
3. Sistem menghasilkan:

```
document_hash = SHA3-256(document_content)
```

4. Sistem membentuk payload unik:

```
payload = document_id + "|" + document_hash
```

5. User memberikan private key.
6. Sistem menghasilkan:

```
rsa_signature =
sign(payload, rsa_private_key)

eddsa_signature =
sign(payload, eddsa_private_key)
```

7. Signature disimpan:

- Database
- Metadata dokumen

---

# Verification Flow

Ketika dokumen diverifikasi:

```
Uploaded Document
       |
       |
Extract Content
       |
       |
Generate Current Hash
       |
       |
Compare Hash
       |
       |
Verify RSA Signature
       |
       |
Verify EdDSA Signature
       |
       |
Check Key Revocation Status
       |
       |
Verification Result
```

Validasi dilakukan melalui beberapa tahap:

## 1. Content Integrity Validation

Sistem menghitung ulang hash dokumen:

```
hash_current = SHA3-256(current_document_content)
```

Kemudian membandingkan:

```
document_hash == hash_current
```

Jika berbeda, dokumen dianggap telah mengalami perubahan.

---

## 2. Cryptographic Authentication

Sistem melakukan verifikasi:

```
rsa_verify(
payload,
rsa_signature,
rsa_public_key
)

eddsa_verify(
payload,
eddsa_signature,
eddsa_public_key
)
```

---

## 3. Historical Key Validation

Sistem melakukan pengecekan:

```
signed_at < revoked_at
```

Jika dokumen ditandatangani setelah key dicabut:

```
INVALID
```

Jika dokumen ditandatangani sebelum pencabutan:

```
VALID WITH WARNING
```

---

# Security Consideration

## Content-Based Hashing

Digunakan untuk menjaga integritas isi dokumen tanpa memperhatikan perubahan metadata.

Keuntungan:

- Struktur dokumen asli tidak berubah.
- Signature tidak mempengaruhi nilai hash.
- Mendukung berbagai format dokumen.

---

## Replay Attack Prevention

Sistem mencegah penggunaan ulang signature pada dokumen berbeda dengan mengikat signature terhadap:

```
document_id + document_hash
```

Sehingga signature hanya valid untuk satu dokumen tertentu.

---

## Metadata-Based Signature

Signature disimpan pada metadata dokumen sehingga:

- Tidak mengubah isi dokumen.
- Tidak mengubah tampilan dokumen.
- Mempertahankan kompatibilitas format file.

---

# Tech Stack

## Monorepo

| Technology | Usage |
|-|-|
| Bun | Runtime & Package Manager |
| Turborepo | Monorepo Management |

---

## Frontend

| Technology | Usage |
|-|-|
| React | UI Framework |
| Vite | Build Tool |
| TanStack Router | Routing |
| TanStack Query | Data Fetching |
| shadcn/ui | UI Component |
| Tailwind CSS | Styling |

---

## Backend

| Technology | Usage |
|-|-|
| ElysiaJS | Backend Framework |
| TypeScript | Programming Language |
| oRPC | Type-safe API |
| Zod | Validation |

---

## Database

| Technology | Usage |
|-|-|
| PostgreSQL | Relational Database |
| Drizzle ORM | Database ORM |
| Docker | Containerization |

---

# Project Structure

```
.
├── apps
│
│   ├── frontend
│   │   ├── React
│   │   ├── TanStack Router
│   │   └── shadcn/ui
│   │
│   └── backend
│       └── ElysiaJS
│
├── packages
│
│   ├── api
│   │   └── oRPC API Contract
│   │
│   ├── auth
│   │   └── Better Auth
│   │
│   └── db
│       └── Drizzle ORM Schema
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

# Database Design

Entity utama:

## Users

Menyimpan data pengguna.

```
users
|
|-- id
|-- name
|-- email
```

---

## Keys

Menyimpan public key pengguna.

```
keys
|
|-- id
|-- user_id
|-- rsa_public_key
|-- eddsa_public_key
|-- revoked_at
```

Private key tidak disimpan.

---

## Documents

Menyimpan informasi dokumen.

```
documents
|
|-- id
|-- user_id
|-- filename
|-- document_hash
|-- deleted_at
```

---

## Signatures

Menyimpan histori signature.

```
signatures
|
|-- document_id
|-- key_id
|-- rsa_signature
|-- eddsa_signature
|-- signed_at
````

---

# Installation

## Requirements

Pastikan sudah memiliki:

- Bun
- Docker
- PostgreSQL

---

## Clone Repository

```bash
git clone <repository-url>

cd <repository-name>
````

---

## Install Dependencies

```bash
bun install
```

---

## Setup Environment

Copy environment file:

```bash
cp .env.example .env
```

Sesuaikan konfigurasi:

```env
DATABASE_URL=
AUTH_SECRET=
```

---

## Run Database

Jalankan PostgreSQL menggunakan Docker:

```bash
docker compose up -d
```

---

## Run Development Server

Menjalankan seluruh aplikasi:

```bash
bun dev
```

Atau menjalankan aplikasi tertentu:

Frontend:

```bash
bun --filter frontend dev
```

Backend:

```bash
bun --filter backend dev
```

---

# Testing Scenario

Sistem diuji menggunakan beberapa skenario:

| Scenario                              | Expected Result   |
| ------------------------------------- | ----------------- |
| Dokumen asli tanpa perubahan          | Valid             |
| Konten dokumen dimodifikasi           | Invalid           |
| Metadata signature dihapus            | Invalid           |
| Signature digunakan pada dokumen lain | Invalid           |
| Key telah dicabut                     | Warning / Invalid |

---

# Research Contribution

Kontribusi utama implementasi ini:

1. Implementasi hybrid signature menggunakan RSA dan EdDSA.
2. Penyimpanan signature pada metadata tanpa memodifikasi konten dokumen.
3. Implementasi content-based hashing untuk menjaga integritas dokumen.
4. Mekanisme payload binding untuk mitigasi replay attack.
5. Validasi historis menggunakan mekanisme key revocation.

---

# License

This project is developed for academic research purposes.

---

# Author

**Raihan Adam**

Informatics Engineering
Universitas Islam Negeri Sunan Gunung Djati Bandung

Research Topic:

> Hybrid Digital Signature using RSA and EdDSA for Digital Document Security
