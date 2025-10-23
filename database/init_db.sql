-- Fichier : database/init_db.sql
-- Ce script crée la base de données et insère toutes vos questions ESG + KYC

DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS respondents;

-- Table des répondants (KYC B2B)
CREATE TABLE respondents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_first_name TEXT NOT NULL,
    contact_last_name TEXT NOT NULL,
    job_title TEXT,
    email TEXT,
    phone TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des questions
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    question_number TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('ESG', 'KYC')) NOT NULL DEFAULT 'ESG',
    input_type TEXT CHECK(input_type IN ('text', 'radio', 'select')) NOT NULL DEFAULT 'text'
);

-- Options pour les questions à choix (Oui/Non/En cours, etc.)
CREATE TABLE question_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Table des réponses
CREATE TABLE responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    respondent_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    response_text TEXT,
    FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- =============== INSERTION DES QUESTIONS KYC ===============
INSERT INTO questions (section, question_number, question_text, question_type, input_type)
VALUES
('KYC', 'KYC.1', 'Nom de la société', 'KYC', 'text'),
('KYC', 'KYC.2', 'Prénom du contact', 'KYC', 'text'),
('KYC', 'KYC.3', 'Nom du contact', 'KYC', 'text'),
('KYC', 'KYC.4', 'Poste du contact', 'KYC', 'text'),
('KYC', 'KYC.5', 'Email du contact', 'KYC', 'text');

-- =============== INSERTION DES QUESTIONS ESG ===============
-- Section 1: Gouvernance et Stratégie ESG
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Gouvernance et Stratégie ESG', '1.1', 'Existe-t-il un comité ou un organe dédié à la gouvernance ESG/RSE au sein de votre entité ?', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.2', 'L’entité dispose-t-elle d’une politique ou charte ESG/RSE approuvée par la Direction Générale ou le Conseil d’administration ?', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.3', 'Cette politique ou charte est-elle communiquée en interne (auprès du personnel, des filiales ou de la direction) ?', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.4', 'L’entité dispose-t-elle d’un code d’éthique ou de conduite, incluant un mécanisme d’alerte pour signaler les manquements ?', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.5a', 'L’entité dispose-t-elle de politiques spécifiques sur les thématiques suivantes : Environnementale', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.5b', 'L’entité dispose-t-elle de politiques spécifiques sur les thématiques suivantes : Sociale et capital humain', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.5c', 'L’entité dispose-t-elle de politiques spécifiques sur les thématiques suivantes : Santé et sécurité au travail', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.5d', 'L’entité dispose-t-elle de politiques spécifiques sur les thématiques suivantes : Investissement ou financement responsable (si applicable)', 'ESG', 'radio'),
('Gouvernance et Stratégie ESG', '1.6', 'Comment la Direction intègre-t-elle les enjeux ESG dans les décisions stratégiques ?', 'ESG', 'text'),
('Gouvernance et Stratégie ESG', '1.7', 'Quels sont les objectifs ESG prioritaires définis à moyen terme (3 à 5 ans) ?', 'ESG', 'text');

-- Section 2: Gestion des Risques et Matérialité
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Gestion des Risques et Matérialité', '2.1', 'L’entité dispose-t-elle d’une cartographie des risques ESG (impacts, risques, opportunités) ?', 'ESG', 'radio'),
('Gestion des Risques et Matérialité', '2.2', 'Cette analyse repose-t-elle sur une matérialité simple ou double ?', 'ESG', 'select'),
('Gestion des Risques et Matérialité', '2.3', 'Comment les risques ESG sont-ils suivis et mis à jour ?', 'ESG', 'text'),
('Gestion des Risques et Matérialité', '2.4', 'Les risques ESG identifiés sont-ils priorisés en fonction de leur impact et probabilité ?', 'ESG', 'radio');

-- Section 3: Politiques Environnementales
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Politiques Environnementales', '3.1', 'L’entité dispose-t-elle d’une politique environnementale (énergie, déchets, pollution, biodiversité, liée au changement climatique, etc.) ?', 'ESG', 'radio'),
('Politiques Environnementales', '3.2', 'L’entité mesure-t-elle les émissions GES (Scopes 1, 2 et Scope 3 matériel) et suit-elle des indicateurs environnementaux chiffrés (énergie, déchets, biodiversité, etc.) ?', 'ESG', 'radio'),
('Politiques Environnementales', '3.3', 'Quelles actions concrètes sont mises en œuvre pour réduire les impacts environnementaux ?', 'ESG', 'text'),
('Politiques Environnementales', '3.4', 'L’entité a-t-elle défini des objectifs de réduction des émissions de GES et d’autres impacts environnementaux ?', 'ESG', 'radio');

-- Section 4: Capital Humain & Conditions de Travail
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Capital Humain & Conditions de Travail', '4.1', 'L’entité dispose-t-elle d’une politique RH formelle couvrant santé, sécurité, diversité, inclusion et développement des compétences ? Si oui, quelles actions et suivi sont mis en place ?', 'ESG', 'radio'),
('Capital Humain & Conditions de Travail', '4.2', 'Comment le bien-être, la santé et la sécurité des collaborateurs sont-ils assurés et suivis ?', 'ESG', 'text'),
('Capital Humain & Conditions de Travail', '4.3', 'Quelles sont les actions sociales ou solidaires mises en place en faveur du personnel ?', 'ESG', 'text'),
('Capital Humain & Conditions de Travail', '4.4', 'L’entité mesure-t-elle la satisfaction et l’engagement des collaborateurs ?', 'ESG', 'radio');

-- Section 5: Droits humain et Equité
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Droits humain et Equité', '5.1', 'L’entité dispose-t-elle d’une politique de respect des droits humains incluant la chaîne de valeur et les fournisseurs ? Comment la conformité est-elle vérifiée ?', 'ESG', 'radio'),
('Droits humain et Equité', '5.2', 'Des mécanismes de prévention et de traitement des violations des droits humains existent-ils ?', 'ESG', 'radio'),
('Droits humain et Equité', '5.3', 'Comment sont assurés la diversité et l’égalité des chances dans l’entreprise ?', 'ESG', 'text'),
('Droits humain et Equité', '5.4', 'L’entité réalise-t-elle des évaluations ou audits externes pour s’assurer du respect des droits humains ?', 'ESG', 'radio');

-- Section 6: Chaîne de Valeur & Fournisseurs
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Chaîne de Valeur & Fournisseurs', '6.1', 'L’entité intègre-t-elle des critères ESG dans le choix, l’évaluation et les contrats des fournisseurs et partenaires ?', 'ESG', 'radio'),
('Chaîne de Valeur & Fournisseurs', '6.2', 'Comment les fournisseurs sont-ils accompagnés pour améliorer leur performance ESG et intégrer les critères ESG dans leurs contrats ?', 'ESG', 'text');

-- Section 7: Produits, Services & Clients
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Produits, Services & Clients', '7.1', 'Comment les retours des clients et autres parties prenantes sont-ils intégrés dans la stratégie ESG ?', 'ESG', 'text'),
('Produits, Services & Clients', '7.2', 'Comment les produits et services contribuent-ils à des impacts positifs (sociaux ou environnementaux) et ces impacts sont-ils quantifiés et reportés ?', 'ESG', 'text'),
('Produits, Services & Clients', '7.3', 'Existe-t-il une politique d’innovation ou de conception responsable pour les produits/services ?', 'ESG', 'radio');

-- Section 8: Éthique, Conformité & Lutte Contre la Corruption
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Éthique, Conformité & Lutte Contre la Corruption', '8.1', 'L’entité dispose-t-elle d’une politique anti-corruption, AML/CFT, concurrence loyale et cybersécurité ?', 'ESG', 'radio'),
('Éthique, Conformité & Lutte Contre la Corruption', '8.2', 'Comment sont communiquées et appliquées ces politiques en interne ?', 'ESG', 'text'),
('Éthique, Conformité & Lutte Contre la Corruption', '8.3', 'Des audits internes ou externes incluent-ils la conformité ESG et éthique ?', 'ESG', 'radio'),
('Éthique, Conformité & Lutte Contre la Corruption', '8.4', 'L’entité propose-t-elle des formations régulières à ses collaborateurs sur la conformité, l’éthique et la lutte anti-corruption ?', 'ESG', 'radio');

-- Section 9: Communautés & Développement Local
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Communautés & Développement Local', '9.1', 'L’entité participe-t-elle à des actions de mécénat, inclusion ou développement communautaire ?', 'ESG', 'radio'),
('Communautés & Développement Local', '9.2', 'Comment les impacts sociaux positifs de ces initiatives sont-ils mesurés ?', 'ESG', 'text'),
('Communautés & Développement Local', '9.3', 'L’entité évalue-t-elle l’impact socio-économique de ses initiatives locales (emplois, inclusion, services) ?', 'ESG', 'text');

-- Section 10: Communication, Reporting & Transparence
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Communication, Reporting & Transparence', '10.1', 'L’entité publie-t-elle un rapport ESG ou un rapport intégré/extra-financier ? Si oui, à quels standards fait-il référence (GRI, SASB…) et quelles informations clés sont présentées ?', 'ESG', 'radio'),
('Communication, Reporting & Transparence', '10.2', 'Comment l’entité communique ses engagements et résultats ESG auprès des parties prenantes, et ces informations sont-elles vérifiées ou assurées par un organisme tiers ?', 'ESG', 'text');

-- Section 11: Engagement des Parties Prenantes
INSERT INTO questions (section, question_number, question_text, question_type, input_type) VALUES
('Engagement des Parties Prenantes', '11.1', 'Les parties prenantes clés (salariés, clients, régulateurs, communauté) sont-elles identifiées et consultées ?', 'ESG', 'radio'),
('Engagement des Parties Prenantes', '11.2', 'Quelles sont les prochaines priorités ESG ou engagements prévus pour les 12 mois à venir ?', 'ESG', 'text'),
('Engagement des Parties Prenantes', '11.3', 'Les priorités ESG pour les 12 prochains mois sont-elles alignées avec les attentes des parties prenantes et les engagements stratégiques ?', 'ESG', 'radio'),
('Engagement des Parties Prenantes', '11.4', 'Existe-t-il un plan de dialogue ou consultation régulière avec les parties prenantes clés ?', 'ESG', 'radio');

-- =============== INSERTION DES OPTIONS POUR LES QUESTIONS À CHOIX ===============
-- Pour toutes les questions de type "radio" ou "select", on ajoute les options : Oui / Non / En cours
INSERT INTO question_options (question_id, option_text)
SELECT id, 'Oui' FROM questions WHERE input_type IN ('radio', 'select')
UNION ALL
SELECT id, 'Non' FROM questions WHERE input_type IN ('radio', 'select')
UNION ALL
SELECT id, 'En cours' FROM questions WHERE input_type IN ('radio', 'select') AND question_number NOT LIKE '%2.2%';

-- Pour la question 2.2 (matérialité), les options sont différentes
INSERT INTO question_options (question_id, option_text)
SELECT id, 'Simple' FROM questions WHERE question_number = '2.2'
UNION ALL
SELECT id, 'Double' FROM questions WHERE question_number = '2.2'
UNION ALL
SELECT id, 'En cours' FROM questions WHERE question_number = '2.2';