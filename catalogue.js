/* ============================================================
   Catalogue des cours — source unique de la page d'accueil.

   Ajouter un cours = ajouter une entrée ici, puis créer son dossier.
   Rien d'autre à toucher : l'accueil se construit tout seul, et le
   nombre de questions de chaque QCM est compté en chargeant le fichier
   (il ne peut donc jamais être faux).

   Champs d'un cours :
     code, titre, dossier   dossier = nom du répertoire du cours
     sources                dossier des supports, relatif à la racine du site (tools/couverture.py)
     exclure                motifs de fichiers à écarter des sources : nos productions (devoir, compte rendu)
     etat                   "en cours" | "terminé"
     couleur                red | amber | blue | green | purple
     resume                 une phrase
     programme              liste des notions (sert aussi à la recherche)
     ressources             pages du cours, dans l'ordre d'affichage

   Champs d'une ressource :
     type    fiche | examen | atelier | attestation
     page    fichier dans le dossier du cours
     titre, desc
     qcm     { src: fichier de données, cle: 3e argument d'initQCM }  (facultatif)
   ============================================================ */
window.CATALOGUE = [

{
  code: "I2ED",
  titre: "Partiel du 20 novembre — fiche unique",
  dossier: "i2ed-partiel-20-11",
  sources: ["../Gestion de crise", "../Intelligence économique et esprit de défense", "../OSINT et C.T.I"],
  fusion: ["inf5059-gestion-crise", "inf5061-intelligence-economique", "ent5002-osint-cti"],
  exclure: ["LAB_IE_*", "rapport_TP*", "Script_Oral_*", "Certificat_*", "CoursCTI*", "tp_*", "tp2_*", "tp3_*",
            "Séance 1 - Transcription - Cours_2026-11-16_12-32*", "Séance 2 - Transcription - Cours_2026-11-17_11-55*"],
  etat: "en cours",
  couleur: "purple",
  resume: "Gestion de crise, esprit de défense, intelligence économique, menaces hybrides et OSINT réunis en une fiche, avec un chapitre qui relie les cours et un QCM commun.",
  programme: [
    "La crise en entreprise : seuil, information, cellule, facteur humain, stress, équipe",
    "Crise informatique et continuité : RPO, RTO, DMIA, BIA, PCA, PRA, normes",
    "L'État en crise : SGDSN, préfet, DMD, OTIAD, règle des 4I, armées",
    "Contexte stratégique, programmes d'armement, drones",
    "Intelligence économique, ingérence, usurpation d'identité, approches",
    "Menaces hybrides, ingérence numérique, IA, souveraineté, IHEDN",
    "OSINT : disciplines, cadre légal, persona, Dorks, GEOINT, SOCMINT",
    "Qui fait quoi, distinctions à ne pas mélanger"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche unique du partiel",
      desc: "Les fiches Gestion de crise, IE et le module OSINT réordonnés, plus les ponts entre les cours",
      qcm: { src: "qcm.js", cle: "i2ed2011" } },
    { type: "examen", page: "points-examen.html", titre: "Ce que les profs ont signalé",
      desc: "Les signaux d'examen de tous les intervenants du contrôle" }
  ]
},

{
  code: "ENT5002",
  titre: "OSINT et Cyber Threat Intelligence",
  dossier: "ent5002-osint-cti",
  sources: "../OSINT et C.T.I",
  exclure: ["rapport_TP*", "Script_Oral_*", "Certificat_*"],
  etat: "en cours",
  couleur: "green",
  resume: "Le renseignement sur la menace, de l'indicateur de compromission aux tactiques de l'attaquant : un IoC se change en secondes, un comportement coûte cher.",
  programme: [
    "CTI et CTH, cycle du renseignement, sources (OSINT, HUMINT, SIGINT…)",
    "Les quatre niveaux : technique, opérationnel, tactique, stratégique",
    "Les six sources de menace",
    "IoC, IoA, pyramide de la douleur ; observable, artefact, indicateur",
    "Vulnérabilités : CVE, CWE, 0-day, CVSS, EPSS, KEV ; risque",
    "STRIDE, Kill Chain, Diamond, MITRE ATT&CK, arbre d'attaque",
    "TIP, MISP, OpenCTI, STIX, TLP, ACH",
    "IA et CTI : agents, injection de prompt, ATLAS, garde-fous",
    "Trier des IoC : désamorcer, enrichir, vieillir, décider",
    "Des vulnérabilités aux chemins d'attaque sur ATT&CK",
    "OSINT : disciplines, cadre légal, persona, Tor, limites, L2I",
    "Enquête OSINT : Google Dorks, GEOINT, SOCMINT, outils"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Le support complet des trois cours, les deux premières séances, les trois TP et le module OSINT",
      qcm: { src: "qcm.js", cle: "ent5002" } },
    { type: "examen", page: "points-examen.html", titre: "Ce que le prof a signalé",
      desc: "Évaluation, IA proscrite et notions annoncées comme questions de cours" }
  ]
},

{
  code: "INF5059",
  titre: "Gestion de crise",
  dossier: "inf5059-gestion-crise",
  sources: "../Gestion de crise",
  etat: "en cours",
  couleur: "red",
  resume: "Reconnaître le seuil de crise, piloter sur des faits avec une cellule verticale, et garder sa tête quand le stress ampute la réflexion.",
  programme: [
    "Incident ou crise, seuil de crise, mode dégradé",
    "Impacts, analyse de risques, types de crises",
    "Pourquoi de plus en plus de crises : SI, menace volatile, CrowdStrike",
    "Les 4 critères : impacts, propagation, transversalité, enjeux externes",
    "Redonner l'heure juste, réseaux sociaux, cas de l'hôpital",
    "Faits, suppositions, interprétations ; biais de disponibilité, tunnel, confirmation",
    "Cellule de crise : décideur, coordinateur, gestionnaire de l'information",
    "Temps de la crise : détecter, alerter, mobiliser… PCA, PRA",
    "Émotions, croyances et valeurs ; Système 1 et Système 2",
    "Stress : CINÉ, double estimation, sidération, adrénaline, cohérence cardiaque",
    "Les 5 règles d'or du travail en équipe",
    "Côté État : SGDSN, contrat 10 000, PIV, dissuasion, PPS-A et PPS-M",
    "Opérations intérieures : Sentinelle, Résilience, Harpie, Héphaïstos",
    "Règle des 4I, concours et réquisition, OTIAD et structure miroir",
    "DMD, expression de besoin, ordre d'engagement, main courante",
    "Côté DSI : RPO, RT, RTO, DMIA, WRT, MTD ; escalade DSI vers groupe",
    "Exercice de crise cyber : rôles, main courante, communiquer tôt",
    "BIA, PCM, PCA, PRA ; continuité ou disponibilité, nominal ou normal"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Volets entreprise, État et DSI : seuil de crise, facteur humain, armées, continuité d'activité",
      qcm: { src: "qcm.js", cle: "inf5059" } },
    { type: "examen", page: "points-examen.html", titre: "Ce que le prof a signalé",
      desc: "23 passages où les intervenants insistent, avec la réponse attendue" }
  ]
},

{
  code: "INF5061",
  titre: "Intelligence économique et esprit de défense",
  dossier: "inf5061-intelligence-economique",
  sources: "../Intelligence économique et esprit de défense",
  exclure: ["LAB_IE_*"],
  etat: "en cours",
  couleur: "amber",
  resume: "La maîtrise légale de l'information stratégique pour les entreprises et l'État, et l'esprit de défense qui fait de chacun un acteur de la résilience nationale.",
  programme: [
    "Esprit de défense, sécurité et défense nationales",
    "SGDSN, préfet, réquisition, DMD, IHEDN",
    "Définitions de l'IE : rapport Martre, circulaire de 2011, Wilensky",
    "IE ou espionnage : la frontière légale",
    "Veille, influence, protection ; la rosace de l'EGE",
    "Propriété intellectuelle : à qui appartient une invention",
    "Souveraineté, vassalisation, contre-ingérence",
    "Prédation capitalistique et due diligence",
    "Usurpation d'identité : hypertrucage, fraude au président, domaines",
    "Approches de salariés hors du cadre professionnel",
    "Contexte stratégique : compétition, contestation, affrontement ; LPM",
    "Programmes d'armement, SCORPION, infovalorisation, drones",
    "Menaces hybrides, zone grise, ingérence numérique étrangère",
    "IA accélérateur et cible, souveraineté numérique, IHEDN"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Séance d'ouverture, Flash ingérence DGSI n° 101 et 102, évolution des armées, menaces hybrides",
      qcm: { src: "qcm.js", cle: "inf5061" } }
  ]
},

{
  code: "INF5051",
  titre: "Investigation numérique (forensic)",
  dossier: "inf5051-forensic",
  sources: "../Forensic",
  etat: "terminé",
  couleur: "red",
  resume: "Comprendre ce qui s'est passé à partir des traces : la justice veut des preuves, l'entreprise veut fermer le chemin d'attaque.",
  programme: [
    "Définition, moyen, opportunité, motivation",
    "Justice ou entreprise, attribution",
    "Les types de preuves numériques",
    "Les traces Windows (poster SANS)",
    "Retours d'expérience",
    "Compétences, métiers, SOC et Purple Team",
    "Histoire de la discipline",
    "Le rapport forensic : structure, plan d'action, trois exemples",
    "Matériel et acquisition, juridiction, OSINT, cybercrime, photo et vidéo",
    "Analyse d'une image disque Windows à la main, timeline pour le client",
    "Collecte et préservation : recevabilité, chaîne de possession, mémoire, SSD",
    "Analyse de logiciels malveillants, statique et dynamique",
    "Forensic Windows, Mac et Linux, analyse mémoire et capture réseau",
    "Forensic réseau et mobiles : Cyber Kill Chain, IoC, saisie d'un smartphone",
    "Le pentest, miroir du forensic : boîte noire/grise/blanche, périmètre",
    "Études de cas : Megacorp, audits, TP réseau (déchiffrement TLS, exfiltration)"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Les trois jours complets, plus les 34 quiz du prof repris diapositive par diapositive, et 23 questions ouvertes",
      qcm: { src: "qcm.js", cle: "inf5051" } },
    { type: "examen", page: "points-examen.html", titre: "Ce que le prof a signalé",
      desc: "56 passages des trois jours, avec la réponse attendue" }
  ]
},

{
  code: "INF5049",
  titre: "Contrôle et audit en cybersécurité",
  dossier: "inf5049-controle-audit",
  sources: "../Contrôle et audit",
  exclure: ["TP2_Infrastructure_et_outils*", "guide_compilation_*", "problème_OpenVAS*", "Documentation_Compilation_*", "Rapport_Partie*", "TP3 - *", "TP3_Rapport_*", "TP3_Notes_*", "TP3_Audit_*", "TP3_Demo_*", "msf_*", "etc_*", "gvm_feeds*", "IMG_*"],
  etat: "terminé",
  couleur: "purple",
  resume: "Organiser, mener et restituer une mission d'évaluation : la technique n'en est qu'une partie.",
  programme: [
    "Contrôle, audit, évaluation",
    "Protéger, défendre (LID), agir (LIO, LII)",
    "La carte des missions, PCA et PRA",
    "Manager, senior, junior : qui fait quoi",
    "OIV, OSE, NIS 2, DORA, HDS, SecNumCloud, CRA",
    "Comprendre le client, objectifs cachés, valeur",
    "Périmètre, contraintes humaines, livrables",
    "3 types d'évaluation, boîtes blanche, grise, noire",
    "Contrat d'audit, PASSI, PC d'audit, OpenVAS",
    "Avant, pendant, après : le déroulé d'une mission",
    "Posture, restitution, écrits parapluie",
    "Clause d'arrêt, double enveloppe, contenu du rapport",
    "Veille outils, banc d'essai Metasploitable",
    "Évaluer une vulnérabilité, plan du rapport",
    "arp-scan, nmap, OpenVAS, scan authentifié",
    "10 mises en situation au format de l'interro"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Support, TP 1 à 3, séances 1 à 3, format du partiel, un sujet corrigé et 13 mises en situation",
      qcm: { src: "qcm.js", cle: "inf5049" } },
    { type: "examen", page: "points-examen.html", titre: "Ce que le prof a signalé",
      desc: "48 passages des séances 1 à 3, dont le format du partiel, avec la réponse attendue" },
    { type: "examen", page: "partiel-blanc.html", titre: "Partiel blanc",
      desc: "Une heure, au format annoncé : réseau, questions de cours, mise en situation, avec corrigés" }
  ]
},

{
  code: "ENT5003",
  titre: "Méthodologie de la sécurité",
  dossier: "ent5003-methodologie",
  sources: "../Méthodologie de la sécurité",
  exclure: ["Devoir-*", "Guide-saisie-*", "QCM-ZeroTrust-enonces-reponses-analyse.*", "TP2-ZeroTrust-Plateforme-streaming.*", "Exo.md", "test*", "*.zip", "entrainement_qcm.html"],
  etat: "terminé",
  couleur: "amber",
  resume: "Obligations, normes et méthodes, les quatre approches de la sécurité, l'analyse de risque et EBIOS RM.",
  programme: [
    "Obligations, normes et méthodes, et leurs pièges",
    "Les 7 principes de la normalisation",
    "NIS et NIS 2 : entités essentielles et importantes",
    "Cybersecurity Act et les 3 niveaux d'assurance",
    "ISO 27001 : le SMSI, le PDCA et sa limite",
    "ISO 27002 : les 93 mesures et leurs attributs",
    "Les 4 approches : système, donnée, menace, métier",
    "EBIOS Risk Manager : les 5 ateliers en détail",
    "Défense en profondeur et ses deux limites",
    "CTI : la menace et le cycle du renseignement",
    "Zero trust : principes, 6 piliers, PEP, ZTNA, SASE",
    "Danger, risque, dommage, ISO 31000, les formules",
    "ISO 27005 : le processus et les 4 stratégies de traitement",
    "EBIOS 2010 contre EBIOS RM",
    "Le risque IA : ISO 23894, 42001, 42005, HUDERIA"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Supports et 8 h de transcriptions des deux séances",
      qcm: { src: "qcm.js", cle: "ent5003" } },
    { type: "attestation", page: "ebios-rm.html", titre: "Attestation EBIOS RM",
      desc: "QCM Moodle à valider à 80 % : couverture uniforme des 5 ateliers",
      qcm: { src: "qcm-ebios-rm.js", cle: "ebiosrm" } }
  ]
},

{
  code: "INF5244",
  titre: "Sécurisation des interconnexions",
  dossier: "inf5244-interconnexions",
  sources: "../Sécurisation des interconnexions",
  exclure: [],
  etat: "terminé",
  couleur: "blue",
  resume: "Filtrage, pare-feu à état, iptables, NAT, DMZ et proxys : de la PSSI aux règles.",
  programme: [
    "Le quintuplet, les 4 missions du pare-feu",
    "Les 8 principes fondamentaux de sécurité",
    "MAC, passerelle par défaut, RFC 1918",
    "TCP, UDP, ICMP et DNS",
    "Netfilter : INPUT, FORWARD, OUTPUT",
    "Syntaxe iptables, critères d'une règle, pare-feu à état",
    "NAT, MASQUERADE et SNAT, conntrack",
    "DMZ, bastion, niveaux de sécurité, UTM",
    "PSSI, matrice des flux, règles",
    "Journalisation (LOG), chaînes utilisateur, ip6tables",
    "Proxy explicite et transparent, reverse proxy, WAF",
    "Exercice d'audit corrigé, annexe des ports"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Séances 1 à 3, support officiel et TD",
      qcm: { src: "qcm.js", cle: "inf5244" } },
    { type: "examen", page: "points-examen.html", titre: "Ce que le prof a signalé",
      desc: "35 passages annoncés comme interrogeables, avec la réponse attendue" },
    { type: "atelier", page: "atelier.html", titre: "Atelier",
      desc: "Restituer de mémoire, écrire une règle, trouver l'erreur" }
  ]
},

{
  code: "INF5243",
  titre: "Sécurisation des réseaux locaux",
  dossier: "inf5243-reseaux-locaux",
  sources: "../Sécurisation des réseaux locaux",
  exclure: ["LAB-NAC-*", "*rempli*", "DNS_lab_*", "Fiche de R*"],
  etat: "terminé",
  couleur: "green",
  resume: "Du câble à l'architecture de sécurité : commutation, VLAN, IP, routage, DNS, 802.1X, DMZ.",
  programme: [
    "Support physique, fibre, câblage, PoE",
    "Carte réseau, trame Ethernet, Wi-Fi",
    "Commutation, CAM, ebtables, stacking, SDN",
    "VLANs, attaques VLAN, PVLAN, menace interne",
    "SNMP, port mirroring, pare-feu et zero trust",
    "DHCP snooping, durcissement, AAA, RADIUS, 802.1X",
    "IPv4, IPv6, subnetting, NAT, tables de routage",
    "ICMP, sockets, TCP, scan SYN",
    "DNS, DNSSEC, TLS et inspection profonde",
    "CPCE, imputabilité, NAC",
    "DMZ, bastion, reverse proxy, WAF, NIDS, VPN"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche complète",
      desc: "Les trois séances fusionnées, animations comprises",
      qcm: { src: "qcm.js", cle: "inf5243" } }
  ]
}

];
