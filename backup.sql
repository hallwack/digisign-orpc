--
-- PostgreSQL database dump
--

\restrict KjX6MUDKfb0StGavfepIF0pEQ0emc3Toigts2rA5Sga5gaSafXYQ2vkbbEIwGra

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO root;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: root
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO root;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: root
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO root;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: root
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.account (
    id text NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp without time zone,
    refresh_token_expires_at timestamp without time zone,
    scope text,
    password text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO root;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.documents (
    id text NOT NULL,
    user_id text NOT NULL,
    hash text NOT NULL,
    file_name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


ALTER TABLE public.documents OWNER TO root;

--
-- Name: keys; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.keys (
    id text NOT NULL,
    user_id text NOT NULL,
    key_name text NOT NULL,
    public_key_rsa text NOT NULL,
    public_key_eddsa text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone
);


ALTER TABLE public.keys OWNER TO root;

--
-- Name: session; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.session (
    id text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ip_address text,
    user_agent text,
    user_id text NOT NULL
);


ALTER TABLE public.session OWNER TO root;

--
-- Name: signatures; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.signatures (
    id text NOT NULL,
    document_id text NOT NULL,
    key_id text NOT NULL,
    rsa_signature text NOT NULL,
    eddsa_signature text NOT NULL,
    signed_at timestamp with time zone DEFAULT now(),
    signing_duration real DEFAULT 0 NOT NULL,
    rsa_signing_duration real DEFAULT 0 NOT NULL,
    eddsa_signing_duration real DEFAULT 0 NOT NULL
);


ALTER TABLE public.signatures OWNER TO root;

--
-- Name: user; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."user" OWNER TO root;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.verification OWNER TO root;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: root
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: root
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	5fadba373ebd03d3c2d868249aaf41cce395e9c1a85c535151de9a57466ecc1a	1766067222462
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
yUqFA3hXHjSVx3Qs88ZnBqgvXUMMr8g7	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	credential	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	\N	\N	\N	\N	\N	\N	7b0346fe921c73e509d187d882bc32b4:86000b6591f055c07bc9047dddc795a2c2417368f393d21d9a9d082689e7e6f2fcfc56bba74db3ebff0963d6a9b867b933699aa01c05235e1f3b3140e3b2abce	2026-02-07 11:19:06.149	2026-02-07 11:19:06.149
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.documents (id, user_id, hash, file_name, title, description, created_at, updated_at, deleted_at) FROM stdin;
dDUrkaXdDBqKMcbMLgz2x9HUuChE6OAb	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	60885795fa53fa47157512bfd5be6050cdd65b6bdafd3b27cbaee01c9860adb1	jones2004.pdf	contoh 1	contoh 1 desc	2026-04-01 07:51:05.044+00	2026-04-01 07:51:05.044+00	\N
4HYp60MzByulGzPliNnzHdwW2nxflyjP	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	df6c7a239a19a7ff191747bb3e675282e3d293d75066a0ef0faf8da87645ff4e	example_jurusan.xlsx	contoh 2	contoh 2 desc	2026-04-01 09:20:42.651+00	2026-04-01 09:22:18.186+00	2026-04-01 09:22:18.186+00
kqoYzWRNkPo8J3I2lVy88ifrAX53HQs7	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	311b9db0bf62c723d58e2b41656f186f0dcfe791512a377a530993f61a74a964	example_users.xlsx	contoh 3	contoh 3 desc	2026-04-01 09:21:00.567+00	2026-05-07 07:28:37.279+00	2026-05-07 07:28:37.279+00
xz0tL72HxoFMJ2UZxcODIF71SLz5uznE	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	33b4c817dfe5dac1e033e7915f76b2dc9c359cbddd0e9e65b38eda1bc006e75e	Request Daisho WMS.docx	contoh 4	contoh 4 desc	2026-04-01 09:21:17.099+00	2026-05-07 07:28:46.188+00	2026-05-07 07:28:46.188+00
A6AdGVfgFrgyh9itP4gzCUKWwnIb50V1	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	698c291dec2d3fac6518779cc08fb1fa4ee20c31753c5a3e85b5e0e87512028a	Surat Resign.docx	Contoh 5	contoh 5 desc	2026-04-01 09:30:08.859+00	2026-05-07 07:28:52.233+00	2026-05-07 07:28:52.233+00
FZlFQq1ocf08OwjHSmYOeMrs2Vo8kSxp	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	7d4329776c133315ac212e2f8455de7ff5fde3ed97dad519db552da6cbbf9f19	dokumen-baru-docx-100kb-1.docx	DOCX 100kb 1	DOCX 100kb 1	2026-05-08 05:59:12.251+00	2026-05-08 05:59:12.251+00	\N
wkX98j2XIhEPv7jSr7M95ZwFVXIp352L	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	03525395cf4743307763b0528e8aa6515ecf2b900c25fefc104c8aa6cd4aef1d	dokumen-baru-docx-100kb-2.docx	DOCX 100kb 2	DOCX 100kb 1	2026-05-08 05:59:27.99+00	2026-05-08 05:59:27.99+00	\N
IMUZqoAhtIpcldsjCam3RueXG9onwgE2	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	9c563700c1bdc1a83ae82853b1fdabec17fce1c8df8f1996bbb63d4be507e61c	dokumen-baru-docx-100kb-3.docx	DOCX 100kb 3	DOCX 100kb 3	2026-05-08 05:59:45.934+00	2026-05-08 05:59:45.934+00	\N
VvGR3L6AdCn9FRbMSs4cuRF4QsnKQH8M	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	41f861d405f0330ae46f10cb0ae895cfb4fc135e7e6a089c7ac5eeb804f86e26	dokumen-baru-xlsx-100kb-1.xlsx	XLSX 100kb 1	XLSX 100kb 1	2026-05-08 06:00:10.792+00	2026-05-08 06:00:10.792+00	\N
lM8hBkdfZ471cRIcPYaq2EOdnYBqIdTp	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	5e295f659fc409782035438aedd5a6c509125d400e67824451aa754dfcc9c499	dokumen-baru-xlsx-100kb-2.xlsx	XLSX 100kb 2	XLSX 100kb 2	2026-05-08 06:00:25.123+00	2026-05-08 06:00:25.123+00	\N
To4sDAP9sMEZon5X7aL09lsLkUUon7es	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	d38ed0b41ad71ce8bb6b65453b743699a3fad759f05f5bc68cf1cb09c6eb47e2	dokumen-baru-xlsx-100kb-3.xlsx	XLSX 100kb 3	XLSX 100kb 3	2026-05-08 06:00:38.486+00	2026-05-08 06:00:38.486+00	\N
HV73MBFbyDACHHt9QjrLHeSumoHCduxe	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	e17e7152fefc66e2f517f76b80e70a0cfcfcf2f6148bf0279d5c25a575efbfbc	dokumen-baru-pdf-100kb-1.pdf	PDF 100kb 1	PDF 100kb 1	2026-05-08 06:01:36.784+00	2026-05-08 06:01:36.784+00	\N
d1gKeleLXcOlyPtCRu4r9VbTGVqSkldH	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	e17e7152fefc66e2f517f76b80e70a0cfcfcf2f6148bf0279d5c25a575efbfbc	dokumen-baru-pdf-100kb-2.pdf	PDF 100kb 2	PDF 100kb 2	2026-05-08 06:01:49.944+00	2026-05-08 06:01:49.944+00	\N
rbxZpQh3BFQ7I6iNZyUbcEG8Kkhd690U	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	e17e7152fefc66e2f517f76b80e70a0cfcfcf2f6148bf0279d5c25a575efbfbc	dokumen-baru-pdf-100kb-3.pdf	PDF 100kb 3	PDF 100kb 3	2026-05-08 06:02:07.392+00	2026-05-08 06:02:07.392+00	\N
NoTv94zWngaja9m4zUpw0jFSxMhM6im7	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	4655ab0c76bb69129358933fef37fd2a3070dd8912c0e6aa0523f4a53ba7f3a4	dokumen-baru-pdf-1mb-1.pdf	PDF 1MB 1	PDF 1MB 1	2026-05-08 06:02:32.214+00	2026-05-08 06:02:32.214+00	\N
8jz0Z3vUIHDFydPxvhRRoYcxgYx9czMR	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	4655ab0c76bb69129358933fef37fd2a3070dd8912c0e6aa0523f4a53ba7f3a4	dokumen-baru-pdf-1mb-2.pdf	PDF 1MB 2	PDF 1MB 2	2026-05-08 06:02:46.325+00	2026-05-08 06:02:46.325+00	\N
bPpNH1ITrOfTzJjUko8e5v9OnxhoCmCB	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	4655ab0c76bb69129358933fef37fd2a3070dd8912c0e6aa0523f4a53ba7f3a4	dokumen-baru-pdf-1mb-3.pdf	PDF 1MB 3	PDF 1MB 3	2026-05-08 06:02:59.758+00	2026-05-08 06:02:59.758+00	\N
E9E03re6hvWWeDf4AEmdsZqfc4Rw5csq	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	1b67e29a947c14441ff4a03745bae44f7ec5e50986b0ff2f33bb995a38a6d2e5	dokumen-baru-pdf-10mb-1.pdf	PDF 10MB 1	PDF 10MB 1	2026-05-08 06:03:23.437+00	2026-05-08 06:03:23.437+00	\N
vP3HZw5yD6D42JXDAtoJFhzgYLaIZuyE	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	1b67e29a947c14441ff4a03745bae44f7ec5e50986b0ff2f33bb995a38a6d2e5	dokumen-baru-pdf-10mb-2.pdf	PDF 10MB 2	PDF 10MB 2	2026-05-08 06:03:34.44+00	2026-05-08 06:03:34.44+00	\N
J9v94RcvojexHkxqQi3MbEfysB0bLz0Z	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	1b67e29a947c14441ff4a03745bae44f7ec5e50986b0ff2f33bb995a38a6d2e5	dokumen-baru-pdf-10mb-3.pdf	PDF 10MB 3	PDF 10MB 3	2026-05-08 06:03:47.064+00	2026-05-08 06:03:47.064+00	\N
45WHiC4X6yMy8BgcriSeJL5elVOIy9gv	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	40c3792b5876b210f633b305d9e749a8ccc4f70a67e3193b683ed3b7760b6f3c	dokumen-baru-docx-1mb-1.docx	DOCX 1MB 1	DOCX 1MB 1	2026-05-08 06:04:21.503+00	2026-05-08 06:04:21.503+00	\N
nTuGb7up3DhlUDfQIxQYDdKRVFxEHzGP	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	42b5d86c8ccb4e988af91e1bf3f5459c3acb772615c0bb83278fa4a9d6907ea8	dokumen-baru-docx-1mb-2.docx	DOCX 1MB 2	DOCX 1MB 2	2026-05-08 06:04:34.499+00	2026-05-08 06:04:34.499+00	\N
8piUwFUwRTwsyNup7Z2toC3rBq2tRu4m	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	fee524636a45565eae3a539e677552225661bc7a2939f5f3e71f4d5a62df3c42	dokumen-baru-docx-1mb-3.docx	DOCX 1MB 3	DOCX 1MB 3	2026-05-08 06:04:48.598+00	2026-05-08 06:04:48.598+00	\N
eXdoTWGmBmp1UZoVpmg4eVPeENEP4s6a	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	d3d7f1bd842349ff8b10ce113ad177b7cd023cb80a35462349d926282316f8a3	dokumen-baru-docx-10mb-1.docx	DOCX 10MB 1	DOCX 10MB 1	2026-05-08 06:05:05.2+00	2026-05-08 06:05:05.2+00	\N
PQlKgIr9WJFdGkFLYLNl1sS4EHNQwmn8	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	47de7ce78f71c8521d54e2179967b7157743cd168ad2941c95de5824be67a3cd	dokumen-baru-docx-10mb-2.docx	DOCX 10MB 2	DOCX 10MB 2	2026-05-08 06:05:18.665+00	2026-05-08 06:05:18.665+00	\N
EQRjs7o6qSHxpJidtEhHrREWp23DId1w	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	4ac6bf9edc4e3a9fe33e11909676c65192f29197a79585826a1238e0b9917915	dokumen-baru-docx-10mb-3.docx	DOCX 10MB 3	DOCX 10MB 3	2026-05-08 06:05:35.113+00	2026-05-08 06:05:35.113+00	\N
nbmqdvLTiz7kX2Mi4gbQXELzLvgNhUsI	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	d140c6ba55a001e5ebad7c0d9d7574326457553d180f589e7f1a2cc64b353026	dokumen-baru-xlsx-1mb-1.xlsx	XLSX 1MB 1	XLSX 1MB 1	2026-05-08 07:58:11.322+00	2026-05-08 07:58:11.322+00	\N
wdOvPjKEEaydnhJk7v1i4S2yi2oCUv3C	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	a3fd68002b2663942a679080dce5afab2c430d095e5d500eba8fb1d1ca05e130	dokumen-baru-xlsx-1mb-2.xlsx	XLSX 1MB 2	XLSX 1MB 2	2026-05-08 07:58:28.689+00	2026-05-08 07:58:28.689+00	\N
LN1oNBoAysqh2eJXpm9R8ug4JzCzakqT	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	0131ddf5369265909e7f176209b44951c221e84ed1ea8f3bc4f6325cfed3533c	dokumen-baru-xlsx-1mb-3.xlsx	XLSX 1MB 3	XLSX 1MB 3	2026-05-08 07:58:45.314+00	2026-05-08 07:58:45.314+00	\N
PK2l2maADMr0gFgj6gE0bomr7RfcAxf2	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	10f199f7fb610a4256c373fff722ce20b8401cac7c9f69895204aebd06434d45	dokumen-baru-xlsx-10mb-1.xlsx	XLSX 10MB 1	XLSX 10MB 1	2026-05-08 07:59:16.389+00	2026-05-08 07:59:16.389+00	\N
braB7l8916MYetAToSe3s5vaSRG4u41G	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	917578bb57c48bbf931d79ac7697ee6998b1d246b7e43117788563d6f3b42f02	dokumen-baru-xlsx-10mb-2.xlsx	XLSX 10MB 2	XLSX 10MB 2	2026-05-08 07:59:28.886+00	2026-05-08 07:59:28.886+00	\N
pPLQrIRhcTlFfrwzf67LCNmvNCJqAnWC	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	da65656fe3fb233dfd0f2d3907940c895bdbfaa110f53d142ea16b428d29f5a9	dokumen-baru-xlsx-10mb-3.xlsx	XLSX 10MB 3	XLSX 10MB 3	2026-05-08 07:59:40.767+00	2026-05-08 07:59:40.767+00	\N
Wdyi8nZ0nL86pjxRDX9EdCgNmwuzl7AY	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	67df2cc0d009efa32ffb0eaeba56cda6613c97959bba526a749e9d552c96c30b	dokumen-xlsx-100kb-1.xlsx	XLSX 100kb 1 NEW	XLSX 100kb 1 NEW	2026-05-08 09:53:56.57+00	2026-05-08 09:53:56.571+00	\N
wDgTfwRJssHk79C2SOzJQ42AiwSX91PE	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	3b49560097f1a28fe0e0c9814ee52238953f2e35ce7b0422b23e6914bc364ee5	dokumen-xlsx-100kb-2.xlsx	XLSX 100kb 2 NEW	XLSX 100kb 2 NEW	2026-05-08 09:54:13.51+00	2026-05-08 09:54:13.51+00	\N
3ErxvbjWN2QNnwPzUKlUR9mbCUUSqAa3	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	4f868cef2d49fa2993aa8e19cae6d8a40f3c17260bf45a5d83ab3979c1e1ad34	dokumen-xlsx-100kb-3.xlsx	XLSX 100kb 3 NEW	XLSX 100kb 3 NEW	2026-05-08 09:54:50.679+00	2026-05-08 09:54:50.679+00	\N
woagKJpO8Sj1bVGeFdl1ejI2tXGgOAjV	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	e22f6ce30c5d8e37200ec069f8653db2db45cbc43626d330e931ee710da9a9cf	dokumen-xlsx-1mb-1.xlsx	XLSX 1MB 1 NEW	XLSX 1MB 1 NEW	2026-05-08 10:09:59.742+00	2026-05-08 10:09:59.742+00	\N
1PAgpVROQPTbHMH0I7kji83n1djV8X37	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	88d272bcfc5f7f81a6ca77aa5d552140825e7ca8d71e08afdcece5b454e12329	dokumen-xlsx-1mb-2.xlsx	XLSX 1MB 2 NEW	XLSX 1MB 2 NEW	2026-05-08 10:10:23.138+00	2026-05-08 10:10:23.138+00	\N
zrAFa4lzr21RtuHF7KPV3GlIDGs0xGEl	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	b51f868b4084db8024c7204b5c8782dbcf0e71cc77700c08ec17ceb16e33ee2f	dokumen-xlsx-1mb-3.xlsx	XLSX 1MB 3 NEW	XLSX 1MB 3 NEW	2026-05-08 10:10:55.402+00	2026-05-08 10:10:55.402+00	\N
Nf3ZUaR4nqeojVsHdxecNpKOa0y7jEip	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	b72a9978919e54e21864dda495a32bb01c9387865058a65953adcb29f719bd64	dokumen-xlsx-10mb-1.xlsx	XLSX 10MB 1 NEW	XLSX 10MB 1 NEW	2026-05-08 10:12:16.556+00	2026-05-08 10:12:16.556+00	\N
4Y5thQy1TBWRvKuB4YBkRUyoVjRAcStS	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	ec7119805d4c2a3cb5c0747050b53c0d3a34843b6b2db709765f7e56a97211c4	dokumen-xlsx-10mb-2.xlsx	XLSX 10MB 2 NEW	XLSX 10MB 2 NEW	2026-05-08 10:12:36.889+00	2026-05-08 10:12:36.889+00	\N
UPpdPpMACmHBbzeTY0BvuVCn6UPTMb10	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	35857910b05104167b1ab08428689adeb055a8177541408a1c8550ff81ecf8be	dokumen-xlsx-10mb-3.xlsx	XLSX 10MB 3 NEW	XLSX 10MB 3 NEW	2026-05-08 10:12:55.36+00	2026-05-08 10:12:55.36+00	\N
tu5uWI007TDxj2KpYL0by3kjsZoFZqNJ	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	60885795fa53fa47157512bfd5be6050cdd65b6bdafd3b27cbaee01c9860adb1	jones2004-signed-true-replay-attack-no-sig.pdf	Contoh True Replay Attack	Contoh True Replay Attack	2026-05-12 03:55:05.497+00	2026-05-12 03:55:05.497+00	\N
IV9M4cODNJyP7VpTlR2EwYb95yRD26vc	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	99df6f20e7f2725bd8df9031bea04ec0765c291855cecdd6a3e5f2c228baa56f	PENERAPAN ALGORITMA RSA DAN EDDSA DENGAN METODE HYBRID (Lanjut Bab 4) (REVISI 12 Mei 2025).docx	Dokumen 1	Dokumen 1	2026-05-12 04:04:02.642+00	2026-05-12 04:04:02.642+00	\N
\.


--
-- Data for Name: keys; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.keys (id, user_id, key_name, public_key_rsa, public_key_eddsa, created_at, revoked_at) FROM stdin;
a6RfKhEk68bCjmJgeNB9MAjR86QhETJZ	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	contoh 1	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAobsr9ZC3Y7k2CLIWwZUe\nasarf/Q+PxKg/UdkjgR0Is/ig0tRhL3SK2/aeBG9lpWV0xwKPrZqCLzW2VchL/Qy\njSqK/Ec6PxnPdpGlMGk/oSXzn9M1rBeKaJ6W0qzi9wKOpCYp98sx7LL44QRyasfK\ns3dRL4D2VCfzF8GwZzOojNknCLyuZDgH67XYIRftaY0xBwU4eC+8kvVLhI4pXl/F\nTIoOXtsBKRcTZuwxpCejmrK0193AfH6OKc9JwBo2E1cIFfGVjJJCfle04TyC1QqI\nDvGVCqJERnc6y8RXVdGrhqLSM36Jtcp84C2XK/0cRntT7gxOJ2iGUiprx5atXHMH\nSQIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA5rCSXKDUxo8w2FtzQoWD4v50bwQTPW/XQ7WPOqlD8P8=\n-----END PUBLIC KEY-----\n	2026-04-01 07:51:14.010495+00	\N
fcuQMoZsfskmOSrXP499kBlK9WItq8zy	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	contoh 2	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvwQl59i/RWRP3rtiUNTA\nBUm8viqkbLoph2KQmdhpA7fBAMzzscx2NbpMn5OFfQdTz+fMiRMheo4ab83GsbrF\n0XOdT5y+gX/MGL5ipT7fCqU0AQIgZflvwcSo3mgSC2YHx4XpmrwqF0NDq6twz/D+\nM/+lZSD+Otm71ht7VBXxos88YpoR8g0a3Elxyrj6XKU/8ColNpZYc5A5veMrZ29c\nsWSThWeWc1N4HzZZttYZlq3ikHUCJ28gG+iIdIitU3plh0UDjxJgA+ex8AjmhDlb\nXhCJGucv1bw8XUJbGRVOqJFraAeKyfGZF1k6JfllusBMrUbAxERxFwbWvnKk218R\nqQIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAXXYuNtDaULoFV/mUwovMlSJQk1TKEyx7tWwDx9dLfiE=\n-----END PUBLIC KEY-----\n	2026-04-01 09:21:25.300014+00	\N
KVzslmCL9Ya56qiViAAiVFBWvZILVySo	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	contoh 3	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvgmaDoagaZEsh269QUKp\n/JdjJ6b//F34p0jdVJbVwzLFj+DZ0rPpy1EUra9gyc0HiUqK+hV5Ze4bzcN+fVBX\nLk8HuqouuqyKDU/9DoMYroFmSbYP113uPdnoU5FlLMx4wWTxsw8L5ki2QDbAejGB\n9IMRhmGYuTgv1accNLjrjg/yW9nGrxdi7wWFhYVJdpsLsPnmSug4bIigYEidoQd2\nDRrG6PGsgFRZHNA4xNaap499xOCNwy7oeKISBzyrRkr3wrkv2KTM1WMDKxskFTMu\n2csQBAKevId7w1jHZql67dEZ6SS6VbDNv4ax0bbSuie2awgw1PB3A/W2MxoBPbno\nMQIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA1gNdGL/dowYH9vE4pKApmyrL8eZVVeQQcvLhEZBasRI=\n-----END PUBLIC KEY-----\n	2026-04-01 09:21:32.631974+00	2026-04-01 09:24:44.872+00
Zpk9fBxb5z5CSFHur3yyM0KMqTqAQXBM	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	Contoh 3	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1vKFK4I+/fpvuSSkXtS8\nGHsM0iENEcsmpk61xjHdWc1O63d/4eW+KcH941fPXJntfb0pp0yaf7CNBaUK0RG6\nnYXFi5mpsoBff4fzqHTeDlFybj6XuQHTm+Iyq60ttVimvDrYxLT6aiypSw27E/SC\nyrTXQ1B64wcts/DVNFYZQn3iaSdFGKpgSrHf2S7ENcpADCtrulGE3jgvyuDSqGQe\nTx196a7xi/0Sc2juS3+Ktz7QIx674LeTYA8bE1q2PRwUEowatoEZluesaFr278OF\nK/ChA4hoBaSQKOSN+vdbudieq699IU8qw31VRk8nBMkRsKvNAgFXJGWEW9pf/Lkj\ndQIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAJKege0MTQlTVJhT7fGzC05zS9kbjz1+CanwONJgflzI=\n-----END PUBLIC KEY-----\n	2026-05-12 04:03:25.966821+00	\N
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.session (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id) FROM stdin;
n00KoRIHJwSff8p3XNKDTObHxikGUtid	2026-04-10 13:59:14.891	K5JCrw3vdvMBoSGQVhfmoBOfrLxxun0F	2026-03-13 16:09:47.98	2026-04-03 13:59:14.891		Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4
rk37LiBBydOYSWOEJKKMST5hNqxWApd1	2026-05-18 08:47:35.061	NXuf65B4AoQqbCufcMvG9h3xNAGaeRDJ	2026-05-04 07:24:20.386	2026-05-11 08:47:35.061		Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4
SId7iCr8JZtJ1xHQOfdAoT45HydnJlI1	2026-07-19 07:11:53.047	Tf7Vkbbmvuh7QN5oED1l76wkxIMf4hEc	2026-07-12 07:11:53.047	2026-07-12 07:11:53.047		Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4
\.


--
-- Data for Name: signatures; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.signatures (id, document_id, key_id, rsa_signature, eddsa_signature, signed_at, signing_duration, rsa_signing_duration, eddsa_signing_duration) FROM stdin;
9DfAjMiUYKUXsmqbbKiHAezBp6cPWDz6	A6AdGVfgFrgyh9itP4gzCUKWwnIb50V1	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	jNtCCbePMGebjlGCrlnzZW1o2nEUl7T4ADs7J+R2wC7Z7dMMV7o8OUSR9Sga/E6k91AbE9Mp6yDgqqi/+eBTLSXUmU9Y2kGxEur/HiWfl/THloVa6FfJ5RkkQl6RISGT1jU+G7d6yFYX/L8/S1DzCIkrQIj8xEi1ikdGglLQgoNoXsYZ12hnhye5PoSEFFCX7fZSn3vMn5nsPH+sKqZgejrj4BnueaY7bMDP/4wNcePWc/E0B7Py9QUYfWe3FWyFRmocl2j03KwYMuR8KOtRcps9vI+cSccOI1ctIw2mZLc3yxqY8/elcWE4fDizP2ZhZxJrJDc2wl5EtrNxd3jQGA==	QcOnX0bpLK2FxYkjH7ZN/exZmNBpwsQ0zqtkJSHntJiiFUhnOu1KQYeLEcYzoIqbhjBNE1EkaUP8S8Sh+i30BQ==	2026-04-01 09:30:25.618+00	58.1	54.2	3.9
fQi8XkacMfsOhTOiUr2mIe6WBRsVEr5d	dDUrkaXdDBqKMcbMLgz2x9HUuChE6OAb	a6RfKhEk68bCjmJgeNB9MAjR86QhETJZ	QH2TEJO14AVMVcVz3B9xO5GZb/C+eE/vJ+kNK4ryHBaqz4NiPLikaTwz3jsgxS6WAgEJTV+5yfzAXPU/d8+0uKXISVmNvhwbxSGSfUiT4GLX0pdtd+3HUsLwmvJB8XWfXE4TEx3mvsse4Cl5kJWf1j4rSrGTFJuACTxg6z+WYpiroPqLBQNETOKpW4A/fwNUZFwIusxYTNvc8jNUTRpIeqER1jfgqPpSt5rtJ92B9/sYptuLgT1Sr6LIo5nlAw51I/Hr/TEjsOSyG2CPR7uDeFHfOuOapH4Z8chN2GL4CmklOTgiUVZFZe6OA97MpGMGPRoy85ZaTF3AAd22uuPO2Q==	3bL9N0DrphnTGjGJ10+bRIf2S9NmUyE5LEC3xtpjtouoToZg9+noR1ICmg9vu7GW87kA2L1ZPM7yz0tTXtkbDA==	2026-04-01 08:15:47.607+00	113.8	46.8	67
xskaznCLHyeUvua2AuiX6PQrGiNxbLf6	4HYp60MzByulGzPliNnzHdwW2nxflyjP	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	RkDiLwt21hBfa06o4KBjPGeUI7r41HIxGC9sJAsWG/LwDeBbbBPuxo3/kePDMeIZXDYiGxBx/DpLnsyc5pmB+ryipT6dlXFHTnw45JFn6AIjrq5/hPo4EGuAxdCD+7ibqN/gTCkShqCboNKxVeS/Cd3bzf5trRNKbNS/QchcKz1uFyJgdM7rrVoMr3g3MNXDhrRF4j0+qGzVN867NMxJljiwlJJsED1ZMqCHq8iTfGOBE3HtX2QeFqXI0+CeRuw9yz5jZFSsHwhNlVEug0xCcZ9JOr1jFsfN6/Av70LLvtFa6eteSyv/F0gEuWE/yqwizOsXkriuiF1Sg7ZNsubxCw==	dqocUhZdxT90l9aJlWplIDcThDdM4AEDg1DDzA+T8EtH1hocpT6P0yKW6bbSBskOrHyIKT1vPR3zp8VpHIkyDg==	2026-04-01 09:22:02.821+00	51.6	48.3	3.3
htQIsoq4Cb2GXnlwQHXO3BqMexAYLntH	kqoYzWRNkPo8J3I2lVy88ifrAX53HQs7	KVzslmCL9Ya56qiViAAiVFBWvZILVySo	b2ICrdQdMbJ8bV35nhZutvOxk3XwGUXBxfskT08BsHzEUbdjFxjfZnh6FeaE57yf2UOtoJwUDyMC0eQA7LW7FRVz1id+x/XCZoIKy4dgc7Fgq2lquAFzdTaiDnAgeslQA8I8lfx1DYhgPSgtsrv6OYFHV1iiikhHoJjRF2UEd8BU71G8VcT3/0se0gxna+WGv63iFUjkIJ1DjB2r1GI75FNSF+UMN5WQoecRftv/Qd5d3thZUNbRJZMHXFKKMPPGy7I3XOkchQE5yKDUeyohdrRFRLibd9bIcXsngAQr+1L4xeHmteTptTmWRumQLw5BpDojtMxc29pV1uPoqMW0TA==	PEV5gNQUYHTAJend1eKp6JKSPjInp/bs/CsDhe+g9XPMixes2u3c1lK5NT9trsVVQ+sJrXGCbFclGaBgq8H7Bw==	2026-04-01 09:24:30.054+00	115.2	57.3	57.9
nDqup4gYwqNAQ8GUThl9sNfdhF55B6fu	xz0tL72HxoFMJ2UZxcODIF71SLz5uznE	KVzslmCL9Ya56qiViAAiVFBWvZILVySo	jX2eHPENJK3LiuP0oFcYRob5zwX3nNw3AG16zJUas+hEGraTv38GKGTvvlit/JWeMjJi/edGjc8iOXWyRbEuJOG9K4bgY9uTKFg+dd0nWvDDsHwVIMrrGOrIIx3mwZWlTbu3QpxavZYV70AlMy7haSJFvSUeqDqCvrW2qDlBHtUQtZ2A7QZ2N19vnhW1khh5e6EJUo0N+7jY/U/yqbwrmmF7UwvjQSxjtC+IylS2aGjNbgBUnP2KiZ1SI5KbLx+zZ7iZTvGlWSC1yv3wgV8WWFtYLvguiDBhVaGqoAX92lOkjvmm4dux4YEy3TKNP/q8NAkrQF8ELInXny4+jpkDkQ==	fctaRPFyiZ6OnVD9E9jK83Qt7Da1R7gfVNvfylUIwlEy4lzqP1otJvlRWLCgSZBjt35kwA6+zvgoDUU+AHyKDQ==	2026-04-01 09:26:11.739+00	117	51.5	65.5
jjfkG3dHBKdTGZMxjguPYv72amNm1X2I	HV73MBFbyDACHHt9QjrLHeSumoHCduxe	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	c6IsghmkGnKt2l25dwjL7kQLjoOwTBIkMU1U6izlr3vwFG5bl9KVXEdDsuliE3CAmInjsEGYSwb6AabfhNIEMbaYZ9qwswu2qQJRqW3/ngx4cKYQm2mmPlGt9OhajuiwffsqF5MVfNFwl8L8vdAFr3fSN61/smbEEt0zsjia2NONjZDYENWmtLQ++dwhu9XebC3LEfDRYg6TK2jpuwAHzJMNQv00ik6c3gCr2mrQAYJiPq4/eLGlHVNM5eZ2lR2NosIczzJ2xZcI1GzOedj/KfD5lHbE5IGQJuH8IKy5XEMPAAn8SKz4Gu0lbRtnbEswyOWyMetRctvPnkS4KDNDgg==	GaKYhub+HMmtk8CS0ITdYVEVnmV+U6PCP59QeNGKDuiVx/flII8nwSJsmUI/fcAMykXNPV2glGyXM8EHXSz0Bg==	2026-05-08 08:12:36.135+00	78.5	47.7	30.8
l6DnRIfgEI9hyKvh4UCE92X1HNIvHBay	d1gKeleLXcOlyPtCRu4r9VbTGVqSkldH	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	oCFD1A4gD2KqbRnOmm/TU1LT/w77/miMUTzIZQ5UPZ1uN/ZXmDx6FwJNlrKR900s9uD9OdG24NNXavyxcIKJP9UDcXnr/Zq/uGFXgIMeOhoxSEPWIwl/yqrFOcl127j4l2CBzkk28tkyS9xqbU4E6mADgcrrQw9qMbivaD6zQHdWPc+TsjmGtoLWt3uTMg/Sqe3GIyfsJ+tlSC62fmjugT7SeA4o62mKWcwyS7ADJDe6L7Lz9Y3p8G6sh8quhMMYWSvLvv7znKOiUlvbMnpvzzxLYUNJOZdsr/VEEDnzf8BoJmHq5zWmqQyoosojF6cytlmlhjZ4fVEr1O6T/RLIAg==	2yYIFdZqq5srtnYyKBtB6DhLGlFCaAEfiU3T+HxgiuD5VzBN0lAXVdlAuIJn5VXja9igOvzeDaoXJe0my6ixBg==	2026-05-08 08:14:57.917+00	30.5	28.4	2.1
kzl5kAXVRv7MBLQr4ZTdGxayTBh1ws3N	rbxZpQh3BFQ7I6iNZyUbcEG8Kkhd690U	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	h9b2fIiaWaMKFhOpny8bRl5437DcjwUVLdMOdYon702l8gi+e+6HKcVCAb70z2PjjOvyM0VHRv2IK3DA+RFqIjy8KKTwkwPl5RowVMCgP+MJMCBTBbLWED/lQBsAPV8/X+dpnTUbsFKWmL1HjSP3ynwL8pCN9r+LhoMgTSxZ551y3oO/743A87QXydPfqwjjDO3pVErpaBoV6RtKnEOd+Zq5qBKVoc/jNBrWAf0f8S6H+kFdRPYat8nIWEbYXO7EsHCc2WES/+iYyuJoy1KlRezACJD1pd5Ilo2V6N4sHTBQp32fejyMNl5lVklIg/KhFnMNaEQiqiZkXHuI8eoHLQ==	meNW8lYNkk6qIufy9hvtTKKdVNbG6kNRinbUPju8SQHoU+Dmb0SudLnpif2Qdea1j9pMdvZfIU4OcGYkcd/pBA==	2026-05-08 08:15:14.105+00	32.3	28	4.3
GWK0XcIfB4qaMwsRaokUIlPRijDqdmXN	NoTv94zWngaja9m4zUpw0jFSxMhM6im7	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	ITDt3BUWUiLKFkPrqOrrLMOAyQZUxvBqAXdOLKJoTTtBSddnzCtCA+lMhAILl/PCvG0Gqx6+wV99bSTynEM5PZTvorJWxjNxLzSbo+RoLEcFxCY37Upu5AKec0UqHcbMkF2/OooUDYEPobeEagIhsC8ZHR/JkzInL+kQLWHacwVWi8A5peDRTyD7S23/OA+NsYfeg4G4o/Wl4rt+sjlH5NGG3qbT1R91VcCf44FErsk3mx/OIoQBd0tukcCKCZ1ra1cnEyZ0hrpiCaSowybKHEyyQQxM0GhLEbXIpLhEv1v0o7tEgB/k4K84u4Iv/Ig07Owa1nTeDuRnGLz6n2z7Fw==	oVAb8+kQmrS6DfautSeL4oCsPI6WDfCkae7oJ1a8H+MIqfFu1UK7T5YuQkXUa19VQN1sPTpqrn0qmDFGUtOiBA==	2026-05-08 08:20:42.572+00	47.8	46.5	1.3
MtWNzwkvrX3YLHuEPFloZUVYJBslbA4j	8jz0Z3vUIHDFydPxvhRRoYcxgYx9czMR	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	pl8G5ZKbTpJo5o+JlQ7C+gNjhp8CKiN4uVR+ykrPzpyyTx+MLWWWNoaj7QsiX9mE1y02dr6G2W9FvhAEAj0+mmlGglFNOSoZNv6A8K7Rt8N9aGaG/hstBXFC2H7tektYmtewaUgHBRlTkLGmXU8FMBKk3y6vWMdVepfAAj1p4CAlP2kfqKk8j+bVCxHX3JXPCIezWGyjHHa2TqTH2+HktWCY6rHScXI+35Cv0jpR+DxlKvPBTm6ysbtWCdzeO3+kU/SUGMh22t/2Ryprf2L3zbvjhLbugQ+ZDuq5oPPn2WtO+sg9FMNCZGEfm1ug0164afDJeRTG/7rxaVwySGzfEA==	U+2+a9XDIeMYD5p2IWFqWdniToDFB8AmYJNd9yxxhPljMQZRYPyg7JqOPPG6D6EJzctDi8LpDuCBHZdTxecnDA==	2026-05-08 08:20:56.438+00	31	27.2	3.8
N0igSVxevwHTeBLoe2Qmvftj9M8E8Z58	bPpNH1ITrOfTzJjUko8e5v9OnxhoCmCB	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	XS5uUGFnL31SxJ4f3XFE5XpD2VOcx6dRC+nMdGcmPmWP84VqqhS+nodSlwc/haSqHzlvybH/Q2rfXxubAPHc1ZktVKxU1NQcDX/bsr7dkdyHK1IOGl2QbHzmgegv3NlPTQqRCPmJytPuDF6kyyopDVvdZZfRS7kOkaR4tU0Ci++7kporFAn30QffqsdDiufbkiU6LckpO9rv+pqLzEM0hXMmB2Gtoa0asSCQcl2c1un74a70q3+RSAOEgS9qX4VYmGZHkc2cF8/Iu3GUZRkJUcO/IozotMk67/1WKeAqj17/XggOerqPRpfpEZJ6EUDy0Iq4Lk1yqAUP2Ln3cNfiqA==	uSnVxDMJkjGwXb71idXVT9XvjqNeNGowBH/YtenjpLSBsS6FDueOFMWspt2NvzikLKodozF1rieuR08gSOwsCQ==	2026-05-08 08:21:08.047+00	33.6	29.9	3.7
Go6DyD0aD3z7gougLEPrRJD6UGQpIoTm	E9E03re6hvWWeDf4AEmdsZqfc4Rw5csq	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	jjn1kvL6v4zw0P0NUaiYzUiEuAdc2+0L5neIj4u0WdzEQjmSgs75nyZXQtLYrZgLjPrU9kwr7Q+70+1pd8OYyru9bjIBMNgyGqg1GahBUd13EOhql95ts6q9ge6Bms0QERs4Tjvddaok0Sa2baTkuYr2av20wIzFoBaQm8woYTZ14at/9fSGG267cohMvA8ISGg3FVdPc8WCRVGyg/pFV7+K3e8MXulIZIit/QAoB/bN53pnJY+L47RK91dUNmlSE26WI44U7Mu06jxs8bKrWjVd/GnTK0d7U+sWHQBh+DqYnmfbIXYT/PsDCLzIazJ3IdtGpa23ZdHxon/IukGQxw==	eXoYtaHLTGtWYi0iHy9VnYEfFw2D9HQSJr9gi21zeCxSYgaFTYzLHWFJEvhC1/ZF2NPwzsOJu/BXIh3h8E/CBA==	2026-05-08 08:33:06.624+00	30.8	26.8	4
CwBwGQPgc3LkjHA3jdCfGPw366mMofDq	vP3HZw5yD6D42JXDAtoJFhzgYLaIZuyE	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	aTmFYLrtiDTr2UmyXHtxIUd3Ex8B/VnGdLPPoH/XTHNvMiRjlt5iIU5OFzJrtFCN/stc4dyH1vZ8OyJzILhEmITiJfOGp3+iY+VMBS2c59N1HwwYOh9ft6+kZiB21mnfGT48gfKJqIG5i0x0QI3EQ5VR/8LxgCJBaFN5ol0YzqvotgQSLpzh0TaYKCmxh48KcoSXgtKT0ohr3ZEWvMfcQJfW6VHQJGU3iyXt9EysrkGkr5GviVDJSP05x4Y39HkRno2gAsy6hvYPG49icBR1yiXq3wJ6jz8aQqMvZJaZE2rjpXMWdvB7x94Sb9cNoe+SQvc56ah4Oiw/lspe2vpAMQ==	hu1XOUNjxH5DskjI0wdCskZE4aqWvz5DaJ38DT/IPLBIY8Hte4tOnYtozkHOFuRWj8n16tQKJL8haisHc8EDCg==	2026-05-08 08:33:20.068+00	47	45.1	1.9
XB07QEIjjYLzoXdQ0iMRZAbKtcnhqPfp	J9v94RcvojexHkxqQi3MbEfysB0bLz0Z	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	Cp7joMOTB44+aBkiiqcIkQxoDdttCg6gyuOxQBiyG29UDqkzXOXS2wMVnGVgS0VwR67pCB1qwIu/jbSwC53eojQVMPeZGOkkL8NL26TUJ1ZpE/4EZNkLA5wbnEYcojHCllhdajkrqhuSPOhf5CCGF09Pb3e9qVoX3nGYvopAYXUi8Ex0aE2zt8LGJH94Dm6Lne2iFkALfEr774GxBasDvexmHhCw1rSE4W1a+1jEEdwdb54jNOMJwiIB3WhkSZCx5d2hs0dI6tyZtDz1ZLBeU40ug2ZFTs7MOEYKpsOzONV1E6IWINRbaJzu65VdS+xLoJ/2r1sYTy2HQxeeVIMz0Q==	Z1pY8ZkVGwl4oGMmhRA9UfJfQuoutY9WBVQqTUfn5ciSPPRNIs71a2CdAyx7mS1p+WTyWjas/rMm/r79EJM+DA==	2026-05-08 08:33:32.595+00	30.7	26.5	4.2
ZyD50pv8JZHTz3IxgFPd9dyAGiOCQYwj	FZlFQq1ocf08OwjHSmYOeMrs2Vo8kSxp	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	a+831BKT1SIqrbVY9A9Nd4lADmo1bjrf4Qa8AEJNbISrIeA36AOyICgSsJe30Pb6vcfwsKaBVn5NADWHdCmiobWG1wNmiI1hNRN7F3futeBXxUeuNJJrAqhPBbd1PVqHjZY3HdW4QaVg9N9GP4z+F7N9Urn2IHqw0USAeY248CQdUJG57XOCM+8lJXKj0yew0sDSbh5NHsXA97jk5N9n0Goa/93muLHekHKbSK7i2Meupc6gXR7/ZqmUeAcVgyLgzXKo89FS7edONZUEtKmlePscuA2KzTuO0wNuOSp20KZC4uNXCu42VynQ0IRspdH5PqwfcwZj4Bg3SbUqtblKyg==	CnC3Amig3hUr+hJh0kvYDDucriECPSWE6IfNAshxE6qArEd87Y+VLQNxA36muI0ImvNxvsJGA8k6iXFHlPL+Cg==	2026-05-08 08:35:48.146+00	49.4	45.5	3.9
pz9NuhioTW5PTMWoyV1Rnys5iq8mGRuU	wkX98j2XIhEPv7jSr7M95ZwFVXIp352L	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	AHRJtc7TTs1gx/da0Ht5B8O+T4ALdKrM9lEDmafDqI88XMdTtGJQXifRfqKk+TRwh7fNLnAFG+2h3mXwq30cZYGo391yGfUmUxhuueX0AeZDICdYKkba1XZk9fM1xOenJGdzqKoxMzLRXZ51seQfovH1dS7POqMbthsiHdsGkqq5ARv5EpmPCgZTf3K2ca8ZDV1teQSd8BFkUQIyUYntPGbr+gERWmAmlOvJ2ZvW8q0o2FjX3E7X2TrVUJR7onNEwhjoCEotsWYzuGG66PG24TiVjEUBcYo0OruuX0CyEefypX8VaN94FvY6Mlg+Wh+m0uOEqUS03//q5t5Aid9/eQ==	k+QaGSOXLFn1EIpSaiB5a2X1u3XrjhTWPiBRwCaBvediJQUszVxcv4tRT0McpTYKRGj6SRD/xnBK2oUWMWQCAQ==	2026-05-08 08:35:56.428+00	33.4	31.7	1.7
F3PUW2HShCMhXDl4C03JuFknu8POBzA6	IMUZqoAhtIpcldsjCam3RueXG9onwgE2	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	TvCBn7XHzCxxwLWf1PqF8sgs/oqWE/RTGMKEFyMbSOHqD0KbQylfZ0Uilsd5AhHnbK/hm5MDg8g3gs7yXaJ0p2op3Zj599i7pBCbwab7dsV+yO+yRwvvh4sIau22jQvWf1ycxOhkabJBH1tQhWgn7ZJ85e70e/UlRUM6ukj3G2xKbz2L3RuzoI12JQDoSl8oGCSjCKaOlF4pRH3Y+zSnnYkQ3oJLoZveSjwmsKX7JofNtQR/oYKUNM0VZHm4ej8aWYwDrpkEgXBOdZ3SlK+1I8CW/r3adEQ6Kwh+rpECmUlShMSfx7xYv92M+AW/Ci34YMvphNLOxiGmfB0VI/UAcQ==	U86mktCMXdcNPivcxN2ozQAMKAg7D6NeIgvm3+o1FhYkE4Y19iGlMnGHaTW1XPm36E4CTAlSm36EgQwKBujeAg==	2026-05-08 08:36:05.583+00	32	28.2	3.8
ZT6EIl3hGalo49GGFnn9lGDhsGHNP6qY	45WHiC4X6yMy8BgcriSeJL5elVOIy9gv	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	p4UpfvNe5l2CPi7DreJAW0WaES+7kOFCy/GhaTz/II0DC854sQym9lPKGxao22tbGSoCXL/RL+oK3+qFy0RgHm3FQD3Hru0q5twG96SZKhoNQjK+QwtXoauxgVkbX678gKV3F/DOMUt0+SQjS3IUT1COgPymT3HcB+gsJitXjOgf2U2TXlZbiEJg41aV9IQSwc2oxUhjxoPtqeFDSLERwKkWEoJZVoVy+DNfj5iAQhTiXoj9/TTaYbL+X3zRmhzSpShZZH3apVyo49C9awdXkaQMD7TTWSC2NVCY1hnfjxpxdiArFhx7iaVpdNtQ0050c7ynrA28ihO5XsX/sc+LbQ==	75RRdbQP+DGRpuroI3ghLmnqxi2vLVyh4dUDx91SP32+VMbDtw3TOkYu7zIU2Ozjo1TSfadYuCEQAIEW1VmODA==	2026-05-08 08:37:22.463+00	27.4	23.7	3.7
n9jEG27lLhVvpCxiIJJyqVmY9JxNKTFB	nTuGb7up3DhlUDfQIxQYDdKRVFxEHzGP	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	m+svCa04h+vzIRtjtg6GEoc9cIgIRYnTy8A1ZPboMx9+5gf8IC3u5Qb3U5k+81g/YBUo42H92J2LfAUtl/u5McPoJz7Z8KnKu8yG2QMu8x6IeGpFjQCZ4X/aSfLIYuEhWRM8rbbcYRNtjo21hNuWbT1Vk7gLw9bnw0y0mOJ56tu5SmeqnWjRqTVRHFUMKr+h86+cQyc2ogj1n667N0lHnnmdoJM9KvMlOXJiVGN01nVZ54NeflikaMI9coRIEQ/hpKPbjeh10mbAwbc5loR9C/19uyeGI3GA3ImJ0IJGlZg+fOIjss4rRGt5X7A2or/Cd61H+fDfyK19fpqlkZhz9Q==	AwDYjgpnG83E9S/4wLbOTqPXHKJdGRDix39CJi1uhuPqfGhj3lkkx8M6U/j2P4BW4QNy1s01UVAjJP7s/4XzAg==	2026-05-08 08:37:33.783+00	29.8	26.3	3.5
GVwnHtxQdYrmDiyve36PqqQy8boDTSA4	8piUwFUwRTwsyNup7Z2toC3rBq2tRu4m	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	nUz5HRPLFPBEQvQUwKvRaBdxcDmj0P9KseprVAm2OSMJDlrwcfM2aT5d3ZJOJGgCGlIBb5UdgaL853wSPkhCLZb3hgwWzPmOaaHUxY5+hMlztXqMLPyM0e5lL+X2xOlfUHIaQdINJNnaNJDFHbWVOxGTRI7cEghxV/fLwfjU8H84A/MoB0KRIHFH1CWrL8VU/I9b/p7NiPRIb7q8jIq/v1O46TWnYiFK+y66+S9bxVI72P9Q9+GM/1xdefL03Q8Dvz1VkRmMTT66REbSPdVKMha0oZd6WKZdU6WIqDChqxdDIJlLdDhDXjuDR0MJs6JAod3b25tY2YrjY6fjT4LuTA==	mdUDYf3/BBh3esvhhacicX8ypEjWg6paPR/MabhK3GQVHrAxIRcK6MxnGMrI5kvi8JZJXlZOCIjwvnrOWK2GCQ==	2026-05-08 08:37:47.667+00	29.5	25.6	3.9
tK7XMa9ybBR06OVQXlBg0GIMYyioQDE4	eXdoTWGmBmp1UZoVpmg4eVPeENEP4s6a	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	gZzXXyY1JHwvVH1ERHdOKBFjG82pW2rLOP5rlfTHQR5cbhum4kJsEz+xIvjzudV45/XWlzMhG0cedLcclVUx71EOQwCQEbT9QcS93PPGxyn4X6pnKEAlTopKXZLPK/+8d6cbPJL9SDJhBMG4emsBoSXbHXKBxsykSMIeM3XV6BPG2sSe/lBxWcdb7jusN0nOfT3kw3nnfqNjX0Z4ZJueNqui5t/53JuvwSASat2KnYSDlVVJNXmiLwWocHNsQTv5DeBgPpIPL5Jt816NBLWAbjzckUXrdXDuBDvZsg2pEfOwAPCzxs35Qt2vjpIIYOXe7iMXlk404Pa7aoLqdZgvwQ==	bVXkvZUOCqAokMNu3je1AsCI/yvTijv+qhfHDdIE76nP9yLCziZj036MLiyLb0KR2Wen94Tks02TRwc4Mo5QBA==	2026-05-08 08:38:39.36+00	27.6	23.6	4
Z8I4Lpa9KZcSN5WZmd93UZRkzRoo5bLc	PQlKgIr9WJFdGkFLYLNl1sS4EHNQwmn8	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	VtcdPWJ2nC0bAgFoCLJpjOYxkKGMBcEA1QrDBbrAQnBoSTmy/RueYezLUedHtOURs9o4zQ6O/PuAbxDkLeThkbH3ske8IJ98uVFIHr9QVW2yPJLHUcICJYch6Zq4moPOy8wtsKdqaVeVuITl1u5AKrNiNGHLv1I2+Ad0xIXOlqD3yZxf7lSGq7vFFALDHl3txz7KFkGMbVsLnbZqEIGeCz9ZR79LAXbZ2Lls1N9gkYsZYkFX9pY4oMUjIFeqfjrc3JljuJ+ZACLOXfpOipiLvGw54hZz61TjQJQ0sI2Y7k6H+zCY8X/XYKKhy/C9D8PpyU73GevCmUJLrxRw6jgYvw==	YY2aaflsp1i13WBaZhKpd9yLFD6CK600FLbXJGQG8uXobjZjDmv4XPSrOyYJT3EHQzeRtx2q+yGCCukgY2HNBQ==	2026-05-08 08:38:55.246+00	29.5	25.1	4.4
q91rYNqQk8Zc5PCdywD9S5zllrrzf303	EQRjs7o6qSHxpJidtEhHrREWp23DId1w	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	rnjrGQWwm1M1ABZoq8vTn9NLBc24qenZqh8T+pKNGQ3o3LX4p7CjxOXIv0HgWhX9m4D40EXHZ8cwCTnXlumQR1GHCkxeingMqdCcnHrZapSlaHTQ36uL2oQvZ581/gRyWyskoLjfamau8efyuXlRaRklq4VrbW2ZamY0ZvvegnCBxHjJPnbOHadsuGFrD3EjgPaan2/jy3vby/jnabz6sku/QJiEm0L2urkH86+qsi+mbhsDmxQvIR9/rM+PzWpCgkZnAI7cGEHaW7P8eaMLLUGRdNXhR09LFzzFN8W7hkBcrZgH4NJqGqTk2pIuexzY5q28aub4IrDAXziAaNjaTg==	1ICO0dVFdwMNrv1ymJ1JI4Lrcpu1PcnU1lGTvG/ZxaBpd2kqklBdGqX3LGfusmBPRbmWa5rTc/Ge15HtevWQBg==	2026-05-08 08:39:05.241+00	27.3	23.5	3.8
OrqDBNopcojqlRYgYUChNlJEAPWVWhHL	VvGR3L6AdCn9FRbMSs4cuRF4QsnKQH8M	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	WZiaAD79fWWJ5jkqCuuLQ+OBUOwHMvv+blbfMHbsludJd+ySN6giiyR81uMsQ0JQG4ToDQCfS0vBikvS524x+hzNb9E9gGQfJXFaAD79Y4hiEuQoe0FgI1lEuHbmPXJN08AKTjzG4d8qrqXNL6eC83O+5mJrs5wDr1S/IJ0GT6TcjdpUTipMkdlBvUikuuqLqTvjMyHxsJheFFvrohJA7zru8RxuM6Fr/t4rSTMwRvRYIJ0cDdfau2QBJVicDsxmwC8tV8JHv4sFP1WwNuw+78kV3CqjAuqFEr3wknIaBr6CykAOzuElustm2zKb4w+d8pQyyscGVbE0+8us7RjRqQ==	qg4O1iCbgi6OuKtqZIxI8HG6ag51y6X+brwQHsrtGZQD3Mx7RB/XmurM7KLImQS89drG8SNvezS4G0ntfyM5Bw==	2026-05-08 08:59:47.826+00	44.7	43	1.7
t4hs1J4dq96ma57MyRHdx38xfObQr0X9	lM8hBkdfZ471cRIcPYaq2EOdnYBqIdTp	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	Trin+0An2Y0z/o94zeFcbZCHl66TadvjLA5Ks275ivLDN8kLR7S4bbQrGt0JXs+oyRzPs/+k1v1OKzIHjvj5zKVD4GqPT4ZAyN7ZyfK2R1kqiFtPURMxeIzM2KFU8+lijo639vT+KPdgRNJmMyIAQaizZm4IbGT6+sRFbRAfVks8J7p6fFa+iZUHDQwhtIBIAs/LjEWDCBwZKHIPrH9i78vbROdJnKe9BPDd3vjCMw5Nl+WFzzDg/c4fYfUT+HTzms7PLK6h74ZugPvv6G9I8H9Sy7hYDk0p3e1n2xx5Xgwp3jZeuCvSpCng8SzpdrJTSD7Rm2E28xdaSHb4jCdFRA==	+NTJgRmacWY1gTwXUDS71+oQnwmXGBjlCyUYLNRFd9mhSFZwa2fBpIJoVNEnJUSdt/FK8E+pqL9oB69r/Z6KCQ==	2026-05-08 08:59:57.327+00	31.9	27.5	4.4
AYMyCBsyvIaMrX78TbqwlvQjINoJ87Ex	To4sDAP9sMEZon5X7aL09lsLkUUon7es	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	CYVoqsbsFoFC1iuwz6M/N3hvoirBa+LsVb44DkCCowTUWCpQNvhsuJrJczYnD1QedCJmxUrFj57UHbdu2E5eAB6bYW7xS7l2zVGdVdcwMY7XG5bpN+a6zopNxbsBibpmopolK3FXH00gL8HJg1KWsE4cLjSXsHHYxqSAXZs3Lqq51AmSyFecxPB3ceNVqmgVt13n1m/Lj03++dRJAMNkwdoLFQLqAyEF08k/t0t1HJmhH27EzuDJvMIYtT2XfwIPvXVal6CcnsrY5BrFpFAyyLmTeDbRmL0fYRclANRPi8dsTcqUA5qaG/mYP1yW6alecSPqmnLjUF9InQLFZ/SyKQ==	fUI0V2EVWpk+eX3Z5r/acshTwwTBglCa5k2dFASe8nwygAIRrSw6/i21Yek/Xw9z3QJm3WBHecqCxSCxzCWKBQ==	2026-05-08 09:00:06.562+00	29.7	26.1	3.6
cfaU4Sz883FH0WHAOC0jKzf9oGSFLDRC	nbmqdvLTiz7kX2Mi4gbQXELzLvgNhUsI	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	BfIDeVo4lCQJml/a4RAGKAeDLC8Jn5HUkcKWX8cIRb7rMizWtYCiIiMDJk8Jqk1KNsKHuno4t3Kj54t1TWuLwYGdnre4gaFENYsYzwHkl93Z2O5l4OwSnWdKoeAOKhJ7tNh917g1GOMtNiD1FmikHEXGdA0q2nfcrWwBtil0fzSee+eDYxDrRK0xuxoel3RYZ5japQQgrK4ukY6lSOn++V4G1yqaRvjggQV1cePFMzDJQSl2fdyCQBHxoM6f4ITJR0mkNCslC7xbVVV6M9PZt2dTQOwfMRiejViseeGzugAZa16it5c1cjcI6fka/0C2i/hhr+MU15j7BWUs6BnmJA==	7GaeAmmLxWP0plZDtOZpei8+n8OKJo7aiyjhKzAZcMgqeFMKF2i8XuKUTQOSetYz80uPZk5oLFONxP5CSpBgCQ==	2026-05-08 09:00:19.863+00	30.5	26.5	4
lPesdOSPMF5M1XI1E5gnYDHg3s6xNC63	wdOvPjKEEaydnhJk7v1i4S2yi2oCUv3C	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	cLSe2PPvB1xqJb/ckqCqH6qPdopz0Tg5x7zjMAtFUxn5yDwP+1H30xYS4MU3ATJ1hjkSTtDaMBGlkMbaIgsShLyPSwDANqhBTJX2rE+BnT6wcua8Ag9BwlUSTnTvUJB4Nb+QMeIXyYXE3Z6c1xynRLyDXUC4LpG4dRn3jSECuXU0euzgHSJbhS3TqY+Ct5hWBbIMTl9yah+oG33h7Bq0fwG22tA4NEoN7Hgnm4Ea9RiM71lilLMeWycQD7J1YDHLylOvBn/AY9rO4pUAQsADni73xp1pl+5Kqw5I5SX8L9oMiaylzW2I84xQ9lpw1fVMyZ3O9qhnEeMBxall6aCPdw==	eqXy7xesVjdvO9bPKCb/QkspTLx9r7TIk5dfgudZ0evVj3/msnt3tK6dggMBeA0eHQbJP5OJQY6x/EbKLtZNAw==	2026-05-08 09:00:29.187+00	26.7	25.2	1.5
t3OY4fp3jU1Ovbp6vsUfJ8FVDeaDvDqM	LN1oNBoAysqh2eJXpm9R8ug4JzCzakqT	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	lPn+H+5UdD10kZSHHH8Vf2/lvKJcFZPoAA27XW5PSn4kQXYYy031OVHjDc2s1lI3TUePy3pa9HIOdRGPhFfH1rf01AjPP7hp9yOxPtNswINUf6RlW3GhPHKjddxpHesSDhwnsG0UqK+LnrI531B++siIykqwqWhgu8FUJg6iwLoTEgeV/Z/xRep8Fkrmu5B6GXXLz+KJ4u2KR7iJnx+MRyCe5dTTNa7rgs/NBVnGc1rYzcVIpOoBahS9vjUynhVkQT9HSG5KaLaDyL4bsdXitr3n7tHyCH2nUqst7W80fgv2xV6d7kTHPChH9QrsIPwKtvPZ84lYpiPoqs+5YUJSIA==	7XFdD7Rr9NbZZz+QJKP+qQ3EJVpEWZiAt1coJgQnjFC2U753kAMlC21724dWEghTMe4ZbAA1N+/Zw6sGRyRzAg==	2026-05-08 09:00:37.854+00	32.5	28.3	4.2
cNFvtx9q06W7DztTxBu44egqCvPNd1I5	PK2l2maADMr0gFgj6gE0bomr7RfcAxf2	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	j2B0Jxd9CwAkaSuaoYBykFNRHFAS/YH+i+PtMrHj7Stzy5LenxH9vZTb8hXK62bw3xFjrzpL1yn4NExVHjqTxkstnfIHP8Uz3ZuAVeHXz7n4XLbAtl5JW7XIhT4C5Rh/dw9nNk00nLITHn53DimRNt22ptG2nz9WoQiHPC4xV9MO41LEi80ecuNf9fwvZNa2qJPwDXeHbtFoL3s4RqUJvL+nPS7ZNkupV0pXScOJ63BBEJwNsy/Ib57R2ug6yrjuCcsyYMgP4eW/RnE1aUXpywKSEqp6mFKZlKNRuQ170kVnuvEe9nidnKzGKfMZPToXZB6ZJIkjYY79BVLt8K1Tqg==	VcXToVRpRMCbXzdJUEeJuFPEfj7hfdVy4dvCQ2E0xOGmLN0ZCXZ5cTURIkgU+eLGXxUilXXi2lyxSQMJS0svDw==	2026-05-08 09:00:48.405+00	28.8	24.9	3.9
2BnMupgFLICRYhCP5oOLtIzo2AOdhjnm	braB7l8916MYetAToSe3s5vaSRG4u41G	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	Y3REEzYPE0N3mXSg4njkL3vQvocELqHBth2YLST0yhNhcU9rLRRA6HZmX4EI4cnvvCTZcq8iN2c3jm76va6VKdQh1JiTT+pUNTzUey3YQqzPSRa9+sPfpkLhJKmPFGPgthGWo4+lP9woCT+GfiU4SywgkC9aEr722/gt/MVOOOjcdneEd0I0Qfn3WF1+7A24pklvBbw1CAIHhNLW5cirdCsasLUlZFEgnopw06cf49zjwqGN8+sjzt2BtOIlYpALfVraJuxIaMVfjCkgTwWPGncvbRZX2xpXCcI4s4Cb78V1pUvNn4BGwXn3rqPX888hC4BvDx/n4QIWwpTDj8IDgA==	dzTxlZ72uRKa00qpejYcAph9+6r0t3MtO7T2YZOBAvk5OF4MMME8HCz+e/TZSSJKTGoFW81ZV+RQ4r5HXpXEDQ==	2026-05-08 09:00:57.528+00	51.9	47.9	4
pO6CDVFUtVDr9xQE9yLD0hbVz5bB7R2Y	pPLQrIRhcTlFfrwzf67LCNmvNCJqAnWC	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	ITazi9kZwoYtuATGonQC0CZr2iwo+fdemHoLS1jB0CE/W2R9X2Q8ti4EAQmgMmUab6x2ld1BHpvbk0a9XUJzh+TfTWdfIe4w3kKT1WThRDXYMaiKp8JZmYSWn6Ydm1/96OqrmI5s3VZjj9MrvSgTM5GUSDlbNbanOko6iEAeRvFBNxrXLJ8AGTKskcHflXVbqdtQFX+DNeIQ5ewZm1MG1WWeBIKHLrG8fOcXvCdC1bTHFicLrUs77c9bQnhtrKlBSA71ZF99cEOJSBrm/0g1cUbSt3rLlQzQG/9ka3q9PXRCXx82KJdZzDWcIAtGJVVcs/Wellf6yp2FX4DWf3GfiA==	I86E1eW9fCMbx4c/cXosVp7etXgHJqRX6wOPfsFGFuI3x37vm1evlLRXZKcFCl6qzbnOoieA3D5am447uyPvDQ==	2026-05-08 09:01:07.52+00	46.7	42.2	4.5
qU7ZyENdhbIRCGXKlq6MeBFXddGRX05y	Wdyi8nZ0nL86pjxRDX9EdCgNmwuzl7AY	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	c9SAoObb32YkXaxJMt48WiUIMlu+gJuxFVm1UZXq5gYLf4EmLZpTXW5NHu4uZGJEhtbP1vDLRooZ6G8ydo2v0/n5WRi/XkG/VTxLAVU9BFWLP/bqeTVkDxTyq6xBUE7EKencYOmj16XfZM21Hm+9ZomD/ggHW1Q2A4+o5a4BLqXEBAgPqpCRR1zT+1ycznD07HgWTac50JXGrrl/V4zwvc0cB9sGec1PKhlWMeQEFjs56tx7V8hB+rzaYxYzijibRsyhj8J3eNbOZE8REVS2XrUrjgNEvH5wvfEuAJZPmJjbQyL1BfJVMBfGtbFM+ZuQwVrblOigThWymWSRniaXiQ==	zI3/Yt2e66Gjb49hmk7dhlqIywFfdJN6C7AUpYwn2k8Me+JhyrKRSG44BhvGUdzpCcDIwHUud8fy2fb0tbyXBA==	2026-05-08 09:55:16.389+00	89.9	57.7	32.2
LrnrByX6o57GQXZVBtHU3kPa71i9jw0J	wDgTfwRJssHk79C2SOzJQ42AiwSX91PE	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	d94Tpjjj6P4NrqBYwBDGlZXCmka+bklBy6Fys1UPLKD7G/pk99OvXHFR3mPsp5JVnE8UY4xCnIuuIXE1XETv0jAQg7Fj9EZuaHJvsblYWQcRD9ZEycW2rwY7HAab6U3xApvCvLaheBtKEKLK4Sqx+Cp+NuL8M9DDYR8CSiA1Dv2xRQOL33Nqhn2NFMFhxoC7RJXB4OII6nr9bIr3k6qDy9f5nulZPu7PflRIofAYgXo0q5WlH54H10WQFr+9Mcr2ZtSlxiquUi6AhgSVV2xNbzx8ZqOXrvR3oYoyMJSs/9xJ8gxmo8bbeyjPwHwc6Vey7Ug4LaxR766mOFi9QPXqoA==	6GzV8x+6eYPseR/Xyp+gAEv9Rkdz6ENErj02sUbXpbN1d3vIhqQYa858G5DdiUhJ8XXFPgsdO7H9b17jPhntDA==	2026-05-08 09:55:33.693+00	32.6	30.9	1.7
mYKNKglK3fQQyiocIl6UuMstdH50HoMh	3ErxvbjWN2QNnwPzUKlUR9mbCUUSqAa3	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	LuAoN9OuFcMdGvhCnT1bgdPK/JFBOlWXSL0uznM5fCPZxIUzuYG8/loem7geHStCs75brqnq9dWYGrTtzd9d/xnUh2DtR2j4EPSeWcOtu1m60a2nbF80eLTB6VVXqmGQcU2jtnKryMto2fyAPvlQZnoQZnTfECcJ+QSN1nGHmcTL4ECfySBEgKQY93R0pYUHkWA8J6eYwqwzMrWzH59mgPwRwqLrxnyx1aCbKCNL5jK23sXjwFxQ37A01ALeKhqSA/XjSA83cXe1BheYNqSImoIAahjzD9SEgaERzdYq0imzypJ06j/xwy9MCkHYYS0H3m65qOsT+ToYLtOt1ev/xg==	5MoBN817+lVn8R6ITTKfR93N7zDPGr9v6RP573llnAI1M2mpITQ1ZcVSX3KNF0szEAVb6nPXFU4zHl5iQFKEDQ==	2026-05-08 09:55:47.932+00	34.7	29.9	4.8
NBkwpmcImuZdkASkb2NrYjySYmFpsU0u	woagKJpO8Sj1bVGeFdl1ejI2tXGgOAjV	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	nRnBZKMqENyQfM5zRVScCEPr1QUxfDVth1yLD+lFXkmWd9Y9F0vv2j7oT7OyZ7kAyqiNx2V36Q26Fn8HF75TJ7M9zcX9aWd9FsMzrUmw4yivOQI3T6c1ggtC95lOwrfV5BLoBCbYyvHIyTwSIeP4I4guk/m47MpjYRNmhAuEjMHG+ZNEBJBp3iPfURQRokR4NQHodfuUKVqE9T49bmkVeqBe48NmQyoq0JQjFn+3ClJ7ua6aohzsTG0Xst/wDQCTfE1BNPW/wb+qkD9Z/RfqnMEPivnDJhz+z7jcIhJconYPyh1FMzx8D/oZJfG4R3/5qmMJVAWTWItBp8YvFdJ+JA==	BQL0hi1w+SlqKZrOCI8VIGLyN8O3PhGKh0NIIX/KGqqCHba2zE5EN6yAYmiCsEKjXFpVqtCyEViG6B4N6drCDg==	2026-05-08 10:13:13.095+00	57.4	52.8	4.6
i04mjKSIBZik2TnybM7OZlY9274KH8uo	1PAgpVROQPTbHMH0I7kji83n1djV8X37	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	TynTH6obodjVXjCYfC+iHc94AE55eNj2oFjI6Vn0hEm90srYOZTCHcyVkEMzlb3YFoSDZgf1WxKx0CJuPl9am4/UrYjKMlBZ8BrIURgUWZyUEKghXl0f/XQs0FDclqA+AZqGp98vyVtGXUUJzedrE8aMxguDWAZh/O0QB1N8/Its9cmCYczhPPc4CamI4PFlD+6mHaOGRgsq1RXX0N220wIYDzdJozY82/zpUDr1WFVCl9oi66RdKUB+e8snx0MSPDXJoe/B/wwsZ69wnz+VdUol/gd+Ui0EzUG24WJBwaK7DmrI11BR1EhWvc6IV8cvC4xhBK/9FZMo5ceQ9oT/3Q==	49FQ3bJFhqZWxLsD93YNMmW0xoJOj3umaKG66vCRktoIMCsmfi6UDgNLRVaqIlZ5gtZJKY/FZoGxDwyCwfPZAQ==	2026-05-08 10:13:57.928+00	32.2	28.2	4
50UnZ1cMjnZAW4rt6XrVFpYZXJuQCTkC	zrAFa4lzr21RtuHF7KPV3GlIDGs0xGEl	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	V+GX31OWyCTMzGeXik6QJ3XkYkYj+iNVE1vKvlFyT90C4n8/6FNl8gMFjsN3lvnYGnagoEaJADGPLx8OeOClu2vZLCpL2jqyEOTgkjQsIC8gGhIVVYCRvLtS99GYNzNYRoF7QXjodTNVnWnuki8C6K5esl9AR3SX1/GtpdccaDXMCU1toWse/KDQHevGS50nGw8cKMg+UNW42th6hWk0d2wUIrrtx0HvzjiXig6nj9w7KUFkW8joOMfwXdrveBRNQPPEuTuXCsdpQzIXvs2w7J9jV1PWEHpf8940yLdoiXulfFl4FlZihJntLEXS+iAQi3Wn5s/z5kUYiFn19ZI6Vg==	tKVADXXpqED+DAuMQdnwts1TCVNfnGZB0NZfwgFgVmrd6fXgjpNkWUURZmyJCaVVx76UhcZDOFFv1qnI0XaxBA==	2026-05-08 10:14:07.023+00	31.4	27.3	4
G5bGZ4hvqCDlKiY0iRAcOgKI7GrUOoeD	Nf3ZUaR4nqeojVsHdxecNpKOa0y7jEip	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	tUDLTvru36GsI2YMqn8wTdFgePJFkeVu+jTCKTVLjPXrKYy523a5ql1IlaRacUSnMY7z119ILhQ7j6tF2R+Pty5esM7PmGRYcEfy8viCAPj4TzxXFnB7qUhWqilnNPTo6KdATQTHXDUvBV1ssU8XAmed1O+hLg46UBOen+t1Pmsld3a2kUTXg5gOIpGyqdvo61k1IiFr7XH9T/V1Ztgd1sVZBrMSCRSrpPvMhPqYlT1h3CDtoPnBvRqdnQwnYfM0q5knB8oXdRBtHlXpB4utrMKsRSWUH26j1CI0W4glGKgPuW38seeJ6z18mf4R5K9YTxMkL3wJ0Pls1BtCAOJhAg==	nph8H/4PjBll8NJhBGilwCHri8PsVl/y5uaipRjTTpbA0KvANpxfajKyL2xmmeciwUwzniOjErGIg+pQH6tKAA==	2026-05-08 10:15:04.982+00	48.4	43.8	4.6
xeR5PjVt5tAnto4NPhsehj1VK8AONiEr	4Y5thQy1TBWRvKuB4YBkRUyoVjRAcStS	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	B0qFMMcm37WXlhMkhNytvSCDkO+7I26dTXyiDH9XWUZ3PoJb/TPkMeYFsy4Oja2PsiV406X5F+ya8W1ador6Q/3USX3kZnWcWxe+sh+yijpq/cbWRWKcl10HB7kLS1IrIOx3VXUYqcWk3TErfQQ5rHltm1c0PASqM5enIkYK6BHUxVo08NPJhM8DJaGCw4LBQA5GQvZRZS3BK9BBwnpfCb33yMSqVKs24pQEMEpoa6vU2LPmcfGX9Ov3iUbayrBUm2zgh/2S6MF7loI6znBATugHBZ/6eM348gSNG93+JqUSWe9tne1LKibJ0wDakGlksBhaMPIne3En8h6ETl7tBw==	PYcIC9EY6zs+MYDwWsFWnCUo6Tq/cl8YPpx5oRsFHduyGygYVjO+6JVYijs5VNtgYKG7EX/km7Pa4RRqzXWwBg==	2026-05-08 10:15:15.587+00	34	31.9	2.1
ll0tIBRsTkB0sv0RH9afWMWZ4WbrIPXt	UPpdPpMACmHBbzeTY0BvuVCn6UPTMb10	fcuQMoZsfskmOSrXP499kBlK9WItq8zy	L4RIOPUXB/IAhUSW7/DNjDHKaRnCxn0syOcLMsvRjq1JiK0Z1/LDI0VetU9if2gJzdyHJSMkUlVj7/aMZLjD0hpNcDpSBFbohW6ZvuKRPBwWdwEsgLtokwqDomn+fiGeJr7+biYBt0Za+XXxFAF9EJ7bRflQcwSWYkM0RW/+dwdPreNe1oJ6hr3ojleVCvf/tznuayaxX2ie7t7SrGJjBI/oy6CYoUG8kezdPXLartZsWMTf/OLi5JDISs1OaNcCnO71CFdclS24OKe++uKOGqrElWFYHx1rjPbLHXLkflWEZ4g0MhvxVE00ReZPrFmoE+7udviWWIKBUTDqv4JbfQ==	llPCZQ6NGC7NJPjhz/HDXf0hvRaX74axhmQkV5hyKIchGOZjYK1G8khzGpvEHP4bAzRN3WpjYvMOUIpO20z0CQ==	2026-05-08 10:15:24.112+00	30.6	26.8	3.8
clQtYrCvZTYp3nNqlI65csYdF6TNrjb9	tu5uWI007TDxj2KpYL0by3kjsZoFZqNJ	a6RfKhEk68bCjmJgeNB9MAjR86QhETJZ	Wv9lUiF5JEiErdmaYDHfWwRfil5w1GMODo1e/Y6WsenidRogZ7A4z7BJEW5RZV4fIEcnn5/lPK3sVgCEQ8hq9bGXnvtTl5uLlWz3vGQy5h1WrF5uCZp8mpMbwrOD4fq11IaIp3HgM8UjYi1+YUck1pRDYwc0LYXev555DBn3RVCfj7YgKebm+2TZ/9OBaMP+mJnnWKFUAaRw5iAvAMbC0uoZ1xM9LSKPPT7vrZkHwnhUFVkgtffiuhG2i+8JQW+vpQRg3FX3Owbg7euxGCTKcBmJ7onI3fdu9nmImoDwm6Ftqcbk620xWw5mgY2AZGFQ38JvZge0PCntOzWoCVuZkg==	TI3X6QYPlu+lLYlYFSIRdgf89jxVevPiDYTkoK2x4fnHrxaOlHXWUtOmsuWYxcsTXW94iHz/YHb3N8HekMcNCw==	2026-05-12 03:55:44.075+00	83.8	51.6	32.2
REMJp5Xm0IWy5CeDiUa0eYDfkU0dFwwQ	IV9M4cODNJyP7VpTlR2EwYb95yRD26vc	Zpk9fBxb5z5CSFHur3yyM0KMqTqAQXBM	TQCLCR4mnoDf0hGqGx1s8HXL0zdEc5WEOvU8Yg/ykOrdID9vYV30qJLmNPe222hJnF+drrsNc1tiGdgEhvkMxOlVqfZKytdf4Q0KMOXhuJ7teexmcipydInRurbk33s2HEwSrtT0eBomjJIULxjp6xmtrF1Tl/Z0GmfGZpsTU9M5yzZlb4ShCWyVaJjxsRYlGuTnozkIkjd3Bhmplakk46g9IUG8tjldhUW3fVOHyEO1j6zVFFhuA55M7KjDAmgGkoI/FYLKlSQcFQQYFSOgU/4PHuTGVglpC7vcSwQup2luhrQr6/y68iYcrDPP2pKRO7gyVIxR6NDcEKLH3D9wIQ==	wNtQLIFjcrgjtpwabcsZ5eh+mYl2cqfqWAQIsc/BeVWvAsOR0DKbw4S+5y0DSu4ySl+NS2v0srmzjI6wk3jcDw==	2026-05-12 04:04:27.176+00	72.9	43.9	29
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public."user" (id, name, email, email_verified, image, created_at, updated_at) FROM stdin;
ZErXhdPzu6S8XI1uHZZelu7JCCynwhU4	Raihan	hallwack.id@gmail.com	f	\N	2026-02-07 11:19:06.137	2026-02-07 11:19:06.137
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.verification (id, identifier, value, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: root
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: root
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: keys keys_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT keys_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_unique UNIQUE (token);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX "account_userId_idx" ON public.account USING btree (user_id);


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX "session_userId_idx" ON public.session USING btree (user_id);


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: account account_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: documents documents_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: keys keys_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT keys_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: session session_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: signatures signatures_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: signatures signatures_key_id_keys_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_key_id_keys_id_fk FOREIGN KEY (key_id) REFERENCES public.keys(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KjX6MUDKfb0StGavfepIF0pEQ0emc3Toigts2rA5Sga5gaSafXYQ2vkbbEIwGra

