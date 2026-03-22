--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-22 06:41:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 912 (class 1247 OID 17816)
-- Name: calendar_event_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.calendar_event_status_enum AS ENUM (
    'CONFIRMED',
    'PENDING',
    'CANCELLED'
);


ALTER TYPE public.calendar_event_status_enum OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 17808)
-- Name: calendar_event_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.calendar_event_type_enum AS ENUM (
    'ENTRETIEN',
    'FORMATION',
    'REUNION'
);


ALTER TYPE public.calendar_event_type_enum OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 17749)
-- Name: candidature_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.candidature_status_enum AS ENUM (
    'EN_ATTENTE',
    'EN_COURS',
    'APPROUVEE',
    'REJETEE'
);


ALTER TYPE public.candidature_status_enum OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 17690)
-- Name: company_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public.company_status_enum OWNER TO postgres;

--
-- TOC entry 936 (class 1247 OID 17908)
-- Name: cv_analysis_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cv_analysis_status_enum AS ENUM (
    'ANALYZING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.cv_analysis_status_enum OWNER TO postgres;

--
-- TOC entry 930 (class 1247 OID 17885)
-- Name: interview_session_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_session_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'SCHEDULED'
);


ALTER TYPE public.interview_session_status_enum OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 20307)
-- Name: job_offer_experience_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_offer_experience_enum AS ENUM (
    'CDI',
    'CDD',
    'STAGE',
    'ALTERNANCE',
    'FREELANCE',
    'TEMPS_PARTIEL'
);


ALTER TYPE public.job_offer_experience_enum OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 17722)
-- Name: job_offer_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_offer_status_enum AS ENUM (
    'ACTIVE',
    'CLOSED',
    'DRAFT'
);


ALTER TYPE public.job_offer_status_enum OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 20286)
-- Name: job_offer_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_offer_type_enum AS ENUM (
    'CDI',
    'CDD',
    'STAGE',
    'ALTERNANCE',
    'FREELANCE',
    'TEMPS_PARTIEL'
);


ALTER TYPE public.job_offer_type_enum OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 17860)
-- Name: matching_result_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.matching_result_status_enum AS ENUM (
    'NOUVEAU',
    'EN_COURS',
    'FINALISE'
);


ALTER TYPE public.matching_result_status_enum OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 17839)
-- Name: scoring_result_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.scoring_result_status_enum AS ENUM (
    'COMPLETED',
    'IN_PROGRESS'
);


ALTER TYPE public.scoring_result_status_enum OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 17774)
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'ADMIN',
    'USER',
    'ENTREPRISE'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 17782)
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.user_status_enum OWNER TO postgres;

--
-- TOC entry 230 (class 1255 OID 16610)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 17823)
-- Name: calendar_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_event (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    type public.calendar_event_type_enum NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone NOT NULL,
    participants text[] NOT NULL,
    location character varying,
    status public.calendar_event_status_enum NOT NULL
);


ALTER TABLE public.calendar_event OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17757)
-- Name: candidature; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidature (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "candidateName" character varying NOT NULL,
    "candidateEmail" character varying NOT NULL,
    status public.candidature_status_enum DEFAULT 'EN_ATTENTE'::public.candidature_status_enum NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    "appliedDate" timestamp without time zone NOT NULL,
    "userId" uuid,
    "jobOfferId" uuid
);


ALTER TABLE public.candidature OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17697)
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    sector character varying NOT NULL,
    logo character varying,
    status public.company_status_enum DEFAULT 'ACTIVE'::public.company_status_enum NOT NULL,
    "partnershipDate" date NOT NULL
);


ALTER TABLE public.company OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17915)
-- Name: cv_analysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cv_analysis (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fileName" character varying NOT NULL,
    "analysisScore" integer NOT NULL,
    recommendations text[] NOT NULL,
    "uploadDate" timestamp without time zone NOT NULL,
    status public.cv_analysis_status_enum NOT NULL
);


ALTER TABLE public.cv_analysis OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17891)
-- Name: interview_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_session (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "candidateName" character varying NOT NULL,
    "candidateEmail" character varying NOT NULL,
    "position" character varying NOT NULL,
    duration integer NOT NULL,
    score integer NOT NULL,
    status public.interview_session_status_enum NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    feedback character varying
);


ALTER TABLE public.interview_session OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17729)
-- Name: job_offer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_offer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    location character varying NOT NULL,
    type public.job_offer_type_enum NOT NULL,
    salary character varying NOT NULL,
    description text NOT NULL,
    requirements text[] NOT NULL,
    status public.job_offer_status_enum DEFAULT 'ACTIVE'::public.job_offer_status_enum NOT NULL,
    applicants integer DEFAULT 0 NOT NULL,
    "companyId" uuid,
    benefits text NOT NULL,
    experience public.job_offer_experience_enum NOT NULL
);


ALTER TABLE public.job_offer OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17867)
-- Name: matching_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matching_result (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "candidateName" character varying NOT NULL,
    "candidateEmail" character varying NOT NULL,
    "position" character varying NOT NULL,
    company character varying NOT NULL,
    "matchingScore" integer NOT NULL,
    status public.matching_result_status_enum DEFAULT 'NOUVEAU'::public.matching_result_status_enum NOT NULL,
    "matchDate" timestamp without time zone NOT NULL
);


ALTER TABLE public.matching_result OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17670)
-- Name: portfolio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    skills text[] NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    downloads integer DEFAULT 0 NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    "createdDate" timestamp without time zone NOT NULL,
    "userId" uuid
);


ALTER TABLE public.portfolio OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17843)
-- Name: scoring_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scoring_result (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "candidateName" character varying NOT NULL,
    "candidateEmail" character varying NOT NULL,
    "position" character varying NOT NULL,
    "overallScore" integer NOT NULL,
    criteria jsonb NOT NULL,
    "analysisDate" timestamp without time zone NOT NULL,
    status public.scoring_result_status_enum NOT NULL
);


ALTER TABLE public.scoring_result OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17787)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.user_role_enum DEFAULT 'USER'::public.user_role_enum NOT NULL,
    status public.user_status_enum DEFAULT 'ACTIVE'::public.user_status_enum NOT NULL,
    avatar character varying,
    "registrationDate" timestamp without time zone DEFAULT now() NOT NULL,
    "companyId" uuid
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 5042 (class 0 OID 17823)
-- Dependencies: 225
-- Data for Name: calendar_event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_event (id, title, type, "startTime", "endTime", participants, location, status) FROM stdin;
970c2562-bb54-4a71-a15f-3a2255433401	Interview - Bernadette Abshire	ENTRETIEN	2026-09-19 23:44:47.449	2026-06-02 13:16:27.584	{Clyde.Borer95@hotmail.com}	Fort Joycestad	CONFIRMED
24ced0e3-b6b6-4f99-b1bd-8c87cefbfa8b	Interview - Bernadette Abshire	ENTRETIEN	2027-02-28 00:27:17.523	2026-12-06 18:25:42.996	{Clyde.Borer95@hotmail.com}	North Stephanie	CONFIRMED
e60eeaca-bcef-42eb-babb-b7b4a1dd5890	Interview - Dr. Phil Kohler	ENTRETIEN	2026-11-15 18:21:24.197	2026-07-18 09:12:14.061	{David_Veum@hotmail.com}	South Dylan	CONFIRMED
ec4c9bb9-04d6-40c8-bfeb-01d6ab6088aa	Interview - Dr. Phil Kohler	ENTRETIEN	2026-10-06 02:54:00.148	2027-03-14 03:01:48.878	{David_Veum@hotmail.com}	Tiaraborough	CONFIRMED
88b5aafc-157c-4711-8824-cadb6df8e627	Interview - Camille Schowalter	ENTRETIEN	2026-09-16 23:14:05.035	2026-04-19 03:19:51.262	{Marty.Konopelski98@gmail.com}	Wymanworth	CONFIRMED
3f4cac3c-5952-45aa-b079-78b7546ef9a2	Interview - Florence Schaden IV	ENTRETIEN	2026-05-23 11:42:12.178	2026-04-12 05:16:42.528	{Shannon.Keeling-Rodriguez5@gmail.com}	Appleton	CONFIRMED
b0939fa7-187a-41f5-ab10-ef6e09c6da93	Interview - Florence Schaden IV	ENTRETIEN	2026-04-23 08:42:00.621	2026-12-27 19:21:58.408	{Shannon.Keeling-Rodriguez5@gmail.com}	Rathbury	CONFIRMED
7d84b38d-cc07-46a0-a2bc-2381e8c408c0	Interview - Florence Schaden IV	ENTRETIEN	2027-02-24 18:19:51.774	2027-02-09 15:00:31.52	{Shannon.Keeling-Rodriguez5@gmail.com}	New Janae	CONFIRMED
66cb9567-29bf-4794-bcaf-bcafd43e0673	Interview - Albert Little	ENTRETIEN	2026-08-25 03:20:46.793	2027-02-27 04:55:52.122	{Estell.Raynor@yahoo.com}	Napa	CONFIRMED
da713d71-0529-42ca-9e46-745fa2a2b4a4	Interview - Albert Little	ENTRETIEN	2026-07-09 12:08:53.792	2026-06-13 20:02:14.317	{Estell.Raynor@yahoo.com}	Boganhaven	CONFIRMED
7a6cd3f6-4790-43ff-899c-af6d4383bea6	Interview - Albert Little	ENTRETIEN	2026-04-12 15:49:32.614	2026-09-16 03:30:51.669	{Estell.Raynor@yahoo.com}	South Koby	CONFIRMED
4d9b71a0-7763-438a-ad3e-1daf1bd6a841	Interview - Adam Ankunding	ENTRETIEN	2027-02-10 04:39:41.381	2027-02-02 06:26:19.641	{Margie_Fay23@hotmail.com}	Donnellystead	CONFIRMED
03f2538a-d164-4739-acc1-d4d6d1cecca2	Interview - Adam Ankunding	ENTRETIEN	2026-10-21 18:23:59.469	2027-01-29 00:28:50.432	{Margie_Fay23@hotmail.com}	Lake Astridboro	CONFIRMED
8e6e9ade-803f-457a-8bde-a6e3cc3bc826	Interview - Adam Ankunding	ENTRETIEN	2026-05-01 23:09:55.293	2027-03-21 04:14:57.594	{Margie_Fay23@hotmail.com}	Codyfurt	CONFIRMED
\.


--
-- TOC entry 5040 (class 0 OID 17757)
-- Dependencies: 223
-- Data for Name: candidature; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidature (id, "candidateName", "candidateEmail", status, score, "appliedDate", "userId", "jobOfferId") FROM stdin;
\.


--
-- TOC entry 5038 (class 0 OID 17697)
-- Dependencies: 221
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (id, name, sector, logo, status, "partnershipDate") FROM stdin;
48d456b7-ff2e-41ae-be76-9cf7b85dc356	Bauch - Thompson	Tools	https://picsum.photos/seed/Kd3gnloGk/247/426	ACTIVE	2025-05-01
0fd589c5-1d36-4cb9-840d-933b77063f05	Schoen, Muller and Green	Industrial	https://picsum.photos/seed/Th9Zgaz/2101/2444	ACTIVE	2025-10-07
e5b79613-7349-48bc-bd8d-d3eb5339fed7	O'Reilly - Metz	Beauty	https://picsum.photos/seed/kUH5cSqZ/2435/1897	ACTIVE	2025-07-07
f25a84d5-44bf-4d25-aa40-ec21a2ece051	Abernathy Group	Tools	https://picsum.photos/seed/w60iLRIY/2131/3946	ACTIVE	2025-05-07
cd392cbf-e7fb-423e-bb66-9f31b5eb88ab	Bechtelar Group	Books	https://picsum.photos/seed/4fuP7KF/2451/3807	ACTIVE	2025-11-13
\.


--
-- TOC entry 5046 (class 0 OID 17915)
-- Dependencies: 229
-- Data for Name: cv_analysis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cv_analysis (id, "fileName", "analysisScore", recommendations, "uploadDate", status) FROM stdin;
7c4fcea5-e1f1-46b6-a4c1-fef63d905231	Sue Reynolds_cv.pdf	93	{"Update experience","Add projects"}	2026-03-21 12:23:06.662	ANALYZING
55ec93f8-5082-43d6-b040-defc65c71378	Bernadette Abshire_cv.pdf	74	{"Add projects","Improve skills"}	2026-03-21 10:02:50.181	FAILED
7ba232e7-4e8c-4283-973a-8933a5a5366f	Dr. Phil Kohler_cv.pdf	60	{"Improve skills","Update experience"}	2026-03-21 01:45:44.714	ANALYZING
abec6286-4882-42dc-ab75-2b4c085a9229	Jaime Gleason DDS_cv.pdf	29	{"Improve skills","Update experience"}	2026-03-21 07:56:24.523	ANALYZING
f8236575-83a0-4094-bd28-c95bfa9242d3	Camille Schowalter_cv.pdf	21	{"Update experience","Add projects"}	2026-03-21 04:35:50.393	ANALYZING
cecc1179-2bad-400c-991c-1355124c13dc	Florence Schaden IV_cv.pdf	24	{"Improve skills","Add projects"}	2026-03-20 16:21:27.996	ANALYZING
bee3c467-279d-494c-b9e9-cb2e7c5d49b8	Walter O'Kon_cv.pdf	57	{"Update experience","Improve skills"}	2026-03-20 18:28:22.331	COMPLETED
e43aef95-3472-45ff-a8e7-7e802549baf6	Albert Little_cv.pdf	0	{"Improve skills","Add projects"}	2026-03-21 13:44:14.502	FAILED
6d0973c9-6538-4120-9b07-a82da8ddaddf	Adam Ankunding_cv.pdf	72	{"Add projects","Update experience"}	2026-03-20 18:51:28.772	COMPLETED
9095d378-09a4-4324-bb25-30041d50e484	Cristina Spinka_cv.pdf	81	{"Add projects","Update experience"}	2026-03-21 13:59:41.286	FAILED
\.


--
-- TOC entry 5045 (class 0 OID 17891)
-- Dependencies: 228
-- Data for Name: interview_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_session (id, "candidateName", "candidateEmail", "position", duration, score, status, "startTime", feedback) FROM stdin;
6a0739c4-9710-4b50-8f39-83899fd79730	Bernadette Abshire	Clyde.Borer95@hotmail.com	Future Security Manager	31	8	SCHEDULED	2026-03-20 19:21:27.157	Confugo capitulus voluptatum aspernatur cometes animadverto textilis deserunt depromo.
02af6582-d8f5-40f5-b263-8e360a167191	Bernadette Abshire	Clyde.Borer95@hotmail.com	Global Accounts Technician	62	74	COMPLETED	2026-03-20 23:58:31.539	Minima temperantia coerceo sint tantillus vindico.
f9bfe92f-b4ff-4ab9-9c4c-fa4207f58ebe	Dr. Phil Kohler	David_Veum@hotmail.com	Internal Configuration Orchestrator	60	66	COMPLETED	2026-03-21 08:30:43.99	Culpa crebro comedo xiphias.
76708982-3eae-4d8a-a7e2-9ff919053fab	Dr. Phil Kohler	David_Veum@hotmail.com	Direct Accountability Agent	59	82	SCHEDULED	2026-03-21 02:48:58.64	Crebro voluptatum verbera asper confero convoco.
dca8e71b-18b6-4a97-887c-d27f0ac5d1d8	Camille Schowalter	Marty.Konopelski98@gmail.com	Lead Response Strategist	51	6	ACTIVE	2026-03-20 22:28:14.529	Subvenio conatus compono tredecim terga repudiandae vicinus.
0cfdaf4c-275f-49d3-a5ae-0cb2a622bf26	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Senior Configuration Consultant	62	23	SCHEDULED	2026-03-21 12:37:30.656	Demoror coepi tricesimus excepturi.
00020b58-82a3-46ab-b113-394b1c622c31	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Investor Optimization Planner	65	73	COMPLETED	2026-03-20 17:42:54.841	Aptus varietas dens decet comitatus quisquam.
ad64f3b5-6a56-4556-a221-083e292d5b55	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Global Accounts Technician	31	49	ACTIVE	2026-03-21 13:16:03.072	Curo subiungo adaugeo sophismata avarus derelinquo tui.
aa3352ef-6c53-47d2-9b58-05b30cc41cd5	Albert Little	Estell.Raynor@yahoo.com	Senior Configuration Consultant	60	99	ACTIVE	2026-03-21 01:24:51.378	Quam peccatus tempora ulterius laborum iure supplanto tergiversatio.
147f4d84-0e59-4089-b411-f8e451cef071	Albert Little	Estell.Raynor@yahoo.com	Lead Response Strategist	59	13	SCHEDULED	2026-03-20 19:14:45.294	Amissio administratio cibo vorax socius cruciamentum terminatio statim.
9830ed72-0331-4047-a97d-0cb58692884d	Albert Little	Estell.Raynor@yahoo.com	Corporate Optimization Analyst	55	70	ACTIVE	2026-03-21 03:05:03.033	Doloribus adeptio curvo labore virgo.
499e1cb3-e958-4341-9bfe-ce56e10df922	Adam Ankunding	Margie_Fay23@hotmail.com	Corporate Optimization Analyst	89	55	SCHEDULED	2026-03-21 15:06:13.063	Attollo villa angelus vulnus acies amissio temporibus casso venio.
2a81c7cd-a2ef-4598-9057-01b5b4f115c3	Adam Ankunding	Margie_Fay23@hotmail.com	Lead Response Strategist	49	91	SCHEDULED	2026-03-21 13:39:13.305	Cohaero venia ut tergo antepono corpus dicta bis.
8b91c95f-70c0-4f16-ab5f-4b269dd1d9ea	Adam Ankunding	Margie_Fay23@hotmail.com	Senior Configuration Consultant	45	94	SCHEDULED	2026-03-20 18:50:15.263	Sperno optio vulariter ex currus somnus articulus debilito accommodo eaque.
\.


--
-- TOC entry 5039 (class 0 OID 17729)
-- Dependencies: 222
-- Data for Name: job_offer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_offer (id, title, location, type, salary, description, requirements, status, applicants, "companyId", benefits, experience) FROM stdin;
\.


--
-- TOC entry 5044 (class 0 OID 17867)
-- Dependencies: 227
-- Data for Name: matching_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matching_result (id, "candidateName", "candidateEmail", "position", company, "matchingScore", status, "matchDate") FROM stdin;
b512ee82-2060-4949-b034-5e7e134b3008	Bernadette Abshire	Clyde.Borer95@hotmail.com	Future Security Manager	Schoen, Muller and Green	38	EN_COURS	2026-03-21 08:40:37.462
908c7d28-8c37-4c67-b458-1f19ab67d25a	Bernadette Abshire	Clyde.Borer95@hotmail.com	Global Accounts Technician	Abernathy Group	76	NOUVEAU	2026-03-21 10:47:33.512
36a59196-382d-42ac-a221-a477ca347abe	Dr. Phil Kohler	David_Veum@hotmail.com	Internal Configuration Orchestrator	Bauch - Thompson	66	EN_COURS	2026-03-21 10:44:16.26
80f1cf95-e0a0-4cda-affe-98fe87abeeb1	Dr. Phil Kohler	David_Veum@hotmail.com	Direct Accountability Agent	Bauch - Thompson	51	EN_COURS	2026-03-20 22:53:32.232
40440912-eda7-4ed2-af58-940e94ca38ce	Camille Schowalter	Marty.Konopelski98@gmail.com	Lead Response Strategist	O'Reilly - Metz	12	FINALISE	2026-03-20 22:00:32.805
8f1585fc-e44d-4aff-9711-f4d1d6243fbf	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Senior Configuration Consultant	Schoen, Muller and Green	81	EN_COURS	2026-03-21 14:53:52.712
a7733e7d-0205-42d9-a55a-4b5f1fc23c61	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Investor Optimization Planner	O'Reilly - Metz	40	EN_COURS	2026-03-21 14:56:26.891
39c13a09-993f-419b-8933-cece66327626	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Global Accounts Technician	Abernathy Group	31	NOUVEAU	2026-03-21 11:38:12.859
4ef376f8-e343-46ab-adeb-a9608b5d0e7a	Albert Little	Estell.Raynor@yahoo.com	Senior Configuration Consultant	Schoen, Muller and Green	36	NOUVEAU	2026-03-21 09:43:46.469
ecdfea4c-1c19-4003-9a21-f7446fa2e1ec	Albert Little	Estell.Raynor@yahoo.com	Lead Response Strategist	O'Reilly - Metz	61	EN_COURS	2026-03-20 17:48:16.789
53ed767e-729b-4ab6-958a-827ae52c47f7	Albert Little	Estell.Raynor@yahoo.com	Corporate Optimization Analyst	O'Reilly - Metz	64	FINALISE	2026-03-21 07:17:54.705
8af515cd-1287-4fff-ac62-6b746fa9476b	Adam Ankunding	Margie_Fay23@hotmail.com	Corporate Optimization Analyst	O'Reilly - Metz	6	FINALISE	2026-03-21 09:19:17.877
3fda698a-6fd2-4355-9047-51bc5edd57e8	Adam Ankunding	Margie_Fay23@hotmail.com	Lead Response Strategist	O'Reilly - Metz	4	NOUVEAU	2026-03-20 16:45:31.058
fbc0c30c-27da-460a-acea-adeaa433482c	Adam Ankunding	Margie_Fay23@hotmail.com	Senior Configuration Consultant	Schoen, Muller and Green	30	EN_COURS	2026-03-21 14:35:02.356
\.


--
-- TOC entry 5037 (class 0 OID 17670)
-- Dependencies: 220
-- Data for Name: portfolio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio (id, title, description, skills, views, downloads, likes, "createdDate", "userId") FROM stdin;
1676aba6-f9c5-4ded-a581-0e1a46488498	Global Markets Analyst	Conscendo confugo sit tamen. Libero vicissitudo cibo clementia tepesco comparo clamo dedecor ara calcar. Cometes derideo volva vomica utique accusantium excepturi arma cogo ante.	{Laravel,NestJS,React}	362	95	146	2025-09-11 21:20:19.367	7a6206f5-d603-44bd-968d-a7806f83a28d
4bfa81e6-5350-4e68-a869-af221b929c70	Product Creative Designer	Tametsi arguo vereor cubo aestus averto vomica. Theatrum crudelis torqueo tergeo tamdiu amoveo villa denique denuncio ademptio. Advenio caveo facilis xiphias odit casso.	{NodeJS,Flutter,Laravel}	173	8	79	2025-04-07 08:33:38.995	0cc621b8-64d2-408e-8de8-11ba4d4fc4d6
935f9ccd-9f5c-4e36-a2a1-e85c936b7f2d	Customer Marketing Executive	Patior vulgo labore adhaero convoco virga apto. Crapula caritas fugiat inventore deprecator comminor. Canonicus sordeo desparatus esse pel cognomen crudelis sub.	{NodeJS,NestJS,Laravel}	49	48	152	2025-07-23 21:29:48.01	0cc621b8-64d2-408e-8de8-11ba4d4fc4d6
9ed77fe4-20ce-4ad1-bbe1-79051616e678	National Implementation Producer	Turpis benigne summisse laboriosam tutamen careo aeger testimonium. Arbitro sopor volutabrum desidero tyrannus cubitum. Attero compello acidus atrox tenetur aedificium vis aer assumenda supra.	{Laravel,React,NodeJS}	114	16	72	2025-06-04 05:25:22.741	eeaac6ac-0e88-4e48-894e-b81a958371a2
5f2fa350-9c60-42e1-aaaa-0c2abba8224c	Forward Metrics Assistant	Cumque angelus celebrer ver curatio auctor valeo aro. Vereor arbitro incidunt verto campana contigo. Vado ipsam calco strues curis cedo vergo infit aestus assumenda.	{Laravel,React,NestJS}	476	34	144	2025-04-03 04:55:22.735	77bc5d16-51d4-4984-b9d8-7ac52d637527
bd78bf0a-4fc7-441a-8b08-a178d8ac8e64	Regional Paradigm Assistant	Clementia voco velum antiquus summa somniculosus verecundia terror triumphus. Corrumpo confero infit votum demens credo culpo pax. Talio nam voco universe accusator adicio argentum infit.	{NodeJS,Laravel,NestJS}	224	44	45	2026-03-17 14:42:38.82	77bc5d16-51d4-4984-b9d8-7ac52d637527
b280677c-2043-42bd-b57f-610f43f50598	Global Web Representative	Enim volutabrum crepusculum adicio. Utroque subito curvo tempus colo curso testimonium. Utique deputo ulciscor deleo corporis.	{NodeJS,NestJS,Flutter}	401	20	56	2026-03-01 14:48:22.866	fdeae42b-4591-40ec-ac6a-f2b40655c4ed
fa795e77-d736-42c9-b43c-b8879872d3dc	Lead Applications Director	Saepe vesco volutabrum tot depereo teneo tenax vespillo apto cado. Comis iure comminor corona aut benevolentia angelus depereo ars capitulus. Hic vulticulus socius volaticus voco confido defessus vis.	{NodeJS,Flutter,NestJS}	342	18	146	2025-09-16 06:02:03.142	20b32f63-488e-4b67-ac06-631b764084cb
9d088d3c-c09c-4882-9931-c15842cab05e	District Accounts Consultant	Cupio verbera bis vallum ultio ultra. Tabula clamo uxor usque quia censura facere cerno. Atque crur pauper.	{Laravel,Flutter,NestJS}	135	47	102	2025-12-31 21:03:07.386	20b32f63-488e-4b67-ac06-631b764084cb
795d9394-76ff-4ae6-b956-332d1e44a9af	Chief Accounts Analyst	Possimus tabesco adsum sollers arcesso cilicium absorbeo teres nam. Turpis tripudio creta urbanus torqueo annus autem testimonium capitulus. Reprehenderit vulgaris dedecor accusator sit aqua cognatus tutamen aveho.	{NestJS,NodeJS,React}	103	18	89	2025-07-23 19:44:31.429	b2746e0d-6b6a-4ec6-9476-66bbcd9d75c5
19903cac-1c39-482e-a718-28179df3c7b8	Central Program Strategist	Vulgo angulus arma degero. Audentia cogito nostrum contra defendo subvenio circumvenio cado vero. Ver cicuta thesaurus optio.	{NestJS,Flutter,Laravel}	77	21	140	2025-04-09 17:57:52.39	b2746e0d-6b6a-4ec6-9476-66bbcd9d75c5
4ee56b20-ac87-4413-a437-3dca43d77c40	International Quality Analyst	Theatrum aeger admiratio velit terminatio audacia admitto. Commodo tutis utique. Numquam vitiosus debilito.	{NodeJS,React,Laravel}	454	90	31	2025-05-18 20:28:18.325	b2746e0d-6b6a-4ec6-9476-66bbcd9d75c5
09fae343-d770-496e-a556-9782269badc2	Product Communications Producer	Molestiae omnis theatrum subiungo abstergo quia. Voluptate absum vergo terebro beatus libero via ara angustus. Sumo deinde illo.	{React,NodeJS,NestJS}	194	50	1	2025-08-11 18:03:38.233	fa05677a-f2f1-4531-a016-0b93e13c61f8
05316653-68a9-4fc9-aaaf-a1e145a1ce45	Senior Operations Liaison	Quod ulciscor tendo. Temeritas exercitationem totus delibero atqui absconditus deduco. Antepono commemoro calco cinis denique maiores collum sumptus solvo.	{React,Laravel,Flutter}	204	15	99	2025-09-07 01:07:01.255	74b69783-ed55-4eaa-87d6-06e71a7c9c8a
00aaeb17-185d-49f5-8865-4f2b29652a0b	International Metrics Assistant	Suasoria combibo usque contabesco suffragium rerum ars conscendo ambulo. Placeat audeo depraedor velit delego tamdiu coniecto. Desparatus aperte earum solvo via exercitationem carcer verbera adhuc.	{Laravel,NodeJS,Flutter}	180	33	5	2025-10-14 14:05:39.405	74b69783-ed55-4eaa-87d6-06e71a7c9c8a
366621a4-7c6a-413d-8375-565a555847f8	Direct Data Architect	Verecundia sed sunt stips deficio deficio. Demergo bibo vere sodalitas tertius sono vulgus color. Soluta rerum textor nam summopere atque sulum cariosus advenio.	{NestJS,Flutter,React}	76	48	130	2025-12-11 02:54:33.669	bc44c956-c98d-4890-b513-f06ede0c1a61
bd5c278a-f00f-47d8-b716-cf0444f8def2	Human Group Designer	Autem volubilis cui tabesco apud. Ara minus termes acidus videlicet angelus cicuta templum perspiciatis nemo. Spes strenuus contego cognomen in aureus caries calcar torqueo cursus.	{React,NodeJS,Flutter}	159	7	167	2025-03-31 11:37:12.79	bc44c956-c98d-4890-b513-f06ede0c1a61
\.


--
-- TOC entry 5043 (class 0 OID 17843)
-- Dependencies: 226
-- Data for Name: scoring_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scoring_result (id, "candidateName", "candidateEmail", "position", "overallScore", criteria, "analysisDate", status) FROM stdin;
9adb22ba-ac6f-4592-b2ec-a29f110fdf0b	Bernadette Abshire	Clyde.Borer95@hotmail.com	Future Security Manager	98	{"skills": 14, "education": 1, "experience": 41}	2026-03-20 23:10:28.335	COMPLETED
1c2d8187-4e18-4760-84b5-f22837597e40	Bernadette Abshire	Clyde.Borer95@hotmail.com	Global Accounts Technician	66	{"skills": 42, "education": 12, "experience": 74}	2026-03-20 15:51:29.652	COMPLETED
d7412793-6d52-4ab6-945b-d4b311ee4a97	Dr. Phil Kohler	David_Veum@hotmail.com	Internal Configuration Orchestrator	48	{"skills": 50, "education": 76, "experience": 0}	2026-03-21 07:29:29.508	IN_PROGRESS
a379d14e-2d80-4f89-bca8-9382bad9974e	Dr. Phil Kohler	David_Veum@hotmail.com	Direct Accountability Agent	73	{"skills": 46, "education": 52, "experience": 26}	2026-03-21 05:56:13.958	COMPLETED
f931b090-0c60-43a9-b14c-c736cd64da2d	Camille Schowalter	Marty.Konopelski98@gmail.com	Lead Response Strategist	18	{"skills": 39, "education": 49, "experience": 71}	2026-03-20 17:18:19.753	COMPLETED
e2d7941f-b46c-4328-b1e5-7597573bced7	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Senior Configuration Consultant	22	{"skills": 22, "education": 89, "experience": 6}	2026-03-21 06:23:10.161	IN_PROGRESS
d69754e2-5056-4439-94cb-cbfab0e1b802	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Investor Optimization Planner	19	{"skills": 52, "education": 83, "experience": 96}	2026-03-20 16:16:18.542	COMPLETED
3e65a7bf-502e-49f8-9f1d-867355822459	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	Global Accounts Technician	97	{"skills": 17, "education": 14, "experience": 37}	2026-03-20 22:47:20.699	IN_PROGRESS
c071ed4e-cf80-46bc-b0a9-a0866481e12a	Albert Little	Estell.Raynor@yahoo.com	Senior Configuration Consultant	26	{"skills": 21, "education": 84, "experience": 100}	2026-03-21 03:55:13.611	IN_PROGRESS
bb09c3c2-3785-46b2-a216-5eee7e3b9f87	Albert Little	Estell.Raynor@yahoo.com	Lead Response Strategist	23	{"skills": 37, "education": 70, "experience": 29}	2026-03-20 22:48:26.605	IN_PROGRESS
d851c67d-47d2-4267-b54c-cda5059b4468	Albert Little	Estell.Raynor@yahoo.com	Corporate Optimization Analyst	96	{"skills": 26, "education": 13, "experience": 23}	2026-03-21 08:15:44.435	IN_PROGRESS
abdbb361-d008-4558-b0bb-a7318badcddd	Adam Ankunding	Margie_Fay23@hotmail.com	Corporate Optimization Analyst	21	{"skills": 45, "education": 34, "experience": 10}	2026-03-21 11:59:07.302	IN_PROGRESS
26bd2ee2-6c5c-4bbf-8f95-61c856a7e22d	Adam Ankunding	Margie_Fay23@hotmail.com	Lead Response Strategist	60	{"skills": 27, "education": 42, "experience": 16}	2026-03-20 19:45:53.149	IN_PROGRESS
306d5079-1dfc-4fdb-870e-9ece52ca3496	Adam Ankunding	Margie_Fay23@hotmail.com	Senior Configuration Consultant	39	{"skills": 10, "education": 32, "experience": 3}	2026-03-21 11:10:25.125	IN_PROGRESS
\.


--
-- TOC entry 5041 (class 0 OID 17787)
-- Dependencies: 224
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, password, role, status, avatar, "registrationDate", "companyId") FROM stdin;
7a6206f5-d603-44bd-968d-a7806f83a28d	Sue Reynolds	Timmy_Grimes@hotmail.com	$2b$10$WC7oAvDzCMqdOcJy8SfJq.re8SXVY2OhdzH.C11v7JgtVo5pOVZFG	ENTREPRISE	ACTIVE	https://avatars.githubusercontent.com/u/36718615	2026-03-21 15:23:48.786073	48d456b7-ff2e-41ae-be76-9cf7b85dc356
0cc621b8-64d2-408e-8de8-11ba4d4fc4d6	Bernadette Abshire	Clyde.Borer95@hotmail.com	$2b$10$zEngK9J4whdiu6r3kKr8MO1vz6g19nfQ54fq9vEdkyAkvzkD06AmK	USER	ACTIVE	https://avatars.githubusercontent.com/u/66202978	2026-03-21 15:23:48.786073	\N
eeaac6ac-0e88-4e48-894e-b81a958371a2	Dr. Phil Kohler	David_Veum@hotmail.com	$2b$10$YtPcKEYyfa66I6cj8G7nDO4DHZ0hTPr99lqZxypDrnop4Go0gr5re	USER	ACTIVE	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/82.jpg	2026-03-21 15:23:48.786073	\N
77bc5d16-51d4-4984-b9d8-7ac52d637527	Jaime Gleason DDS	Tate_Monahan-Gleichner@yahoo.com	$2b$10$UDn5nZcGgTX3JUXGaDmx0eP1SNMIk1wUusdUrY.YsMQbpMyTAZxZq	ENTREPRISE	ACTIVE	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/68.jpg	2026-03-21 15:23:48.786073	e5b79613-7349-48bc-bd8d-d3eb5339fed7
fdeae42b-4591-40ec-ac6a-f2b40655c4ed	Camille Schowalter	Marty.Konopelski98@gmail.com	$2b$10$Q8fS8iZQWbJ8vy1PR6TXF.PiBKzmk4Nvx8Uss..o/fmNvMXR4HWmq	USER	ACTIVE	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/59.jpg	2026-03-21 15:23:48.786073	\N
20b32f63-488e-4b67-ac06-631b764084cb	Florence Schaden IV	Shannon.Keeling-Rodriguez5@gmail.com	$2b$10$PcSu1hWdqvxq/DEs.ke2vO51Qy6BuLyyDs55gjUUiYAyjxZUt6/gG	USER	ACTIVE	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/63.jpg	2026-03-21 15:23:48.786073	\N
b2746e0d-6b6a-4ec6-9476-66bbcd9d75c5	Walter O'Kon	Missouri_Hermiston11@gmail.com	$2b$10$eQ/LTXDu94w5vXfO1FMj4.qjJuTu20tAkKRVPAmU.nmEfRYDlTvu.	ENTREPRISE	ACTIVE	https://avatars.githubusercontent.com/u/44606233	2026-03-21 15:23:48.786073	0fd589c5-1d36-4cb9-840d-933b77063f05
fa05677a-f2f1-4531-a016-0b93e13c61f8	Albert Little	Estell.Raynor@yahoo.com	$2b$10$1vHdkgfcBj.0TgcXcIzKUekh19jtes6PiG6BAR.hucaIJuKDAp1z6	USER	ACTIVE	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/21.jpg	2026-03-21 15:23:48.786073	\N
74b69783-ed55-4eaa-87d6-06e71a7c9c8a	Adam Ankunding	Margie_Fay23@hotmail.com	$2b$10$OA726BsxAL5FuViLhCpGuu469hkMuQg0cDE1.pMg7EGWcwb96xBrW	USER	ACTIVE	https://avatars.githubusercontent.com/u/63111112	2026-03-21 15:23:48.786073	\N
bc44c956-c98d-4890-b513-f06ede0c1a61	Cristina Spinka	Walker38@gmail.com	$2b$10$In1PyTV9fO7scGkIyDlbI.axbfllRQZvzTPJDN3PtilvEQhV.bcIq	ENTREPRISE	ACTIVE	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/64.jpg	2026-03-21 15:23:48.786073	f25a84d5-44bf-4d25-aa40-ec21a2ece051
\.


--
-- TOC entry 4866 (class 2606 OID 17710)
-- Name: company PK_056f7854a7afdba7cbd6d45fc20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 17837)
-- Name: calendar_event PK_176fe24e6eb48c3fef696c7641f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_event
    ADD CONSTRAINT "PK_176fe24e6eb48c3fef696c7641f" PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 17772)
-- Name: candidature PK_35a6008b023f10df280baced5bc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidature
    ADD CONSTRAINT "PK_35a6008b023f10df280baced5bc" PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 17928)
-- Name: cv_analysis PK_4c20584b4524a3dd9d5ee17883e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cv_analysis
    ADD CONSTRAINT "PK_4c20584b4524a3dd9d5ee17883e" PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 17747)
-- Name: job_offer PK_5286026037ab5fb5acfcb7e1829; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_offer
    ADD CONSTRAINT "PK_5286026037ab5fb5acfcb7e1829" PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 17688)
-- Name: portfolio PK_6936bb92ca4b7cda0ff28794e48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT "PK_6936bb92ca4b7cda0ff28794e48" PRIMARY KEY (id);


--
-- TOC entry 4878 (class 2606 OID 17858)
-- Name: scoring_result PK_952e52854ff3904bafad59267d2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scoring_result
    ADD CONSTRAINT "PK_952e52854ff3904bafad59267d2" PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 17804)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 17906)
-- Name: interview_session PK_def939526a09b54407f609cc226; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_session
    ADD CONSTRAINT "PK_def939526a09b54407f609cc226" PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 17883)
-- Name: matching_result PK_e6839cddda48b39f0385abd3c38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matching_result
    ADD CONSTRAINT "PK_e6839cddda48b39f0385abd3c38" PRIMARY KEY (id);


--
-- TOC entry 4874 (class 2606 OID 17806)
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- TOC entry 4889 (class 2606 OID 17949)
-- Name: user FK_86586021a26d1180b0968f98502; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES public.company(id);


--
-- TOC entry 4887 (class 2606 OID 17944)
-- Name: candidature FK_8743d791f268ed2a7bbdcce938f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidature
    ADD CONSTRAINT "FK_8743d791f268ed2a7bbdcce938f" FOREIGN KEY ("jobOfferId") REFERENCES public.job_offer(id);


--
-- TOC entry 4885 (class 2606 OID 17929)
-- Name: portfolio FK_9d041c43c782a9135df1388ae16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT "FK_9d041c43c782a9135df1388ae16" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 4888 (class 2606 OID 17939)
-- Name: candidature FK_af31c57a7a0ebba5ccf5efd2b58; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidature
    ADD CONSTRAINT "FK_af31c57a7a0ebba5ccf5efd2b58" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 4886 (class 2606 OID 17934)
-- Name: job_offer FK_edf4833b0e156904893c4e59a7e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_offer
    ADD CONSTRAINT "FK_edf4833b0e156904893c4e59a7e" FOREIGN KEY ("companyId") REFERENCES public.company(id);


-- Completed on 2026-03-22 06:41:10

--
-- PostgreSQL database dump complete
--


