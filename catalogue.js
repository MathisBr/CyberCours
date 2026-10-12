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
  code: "INF5049",
  titre: "Contrôle et audit en cybersécurité",
  dossier: "inf5049-controle-audit",
  sources: "../Contrôle et audit",
  exclure: [],
  etat: "en cours",
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
    "7 mises en situation au format de l'interro"
  ],
  ressources: [
    { type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "Support, TP 1 et séance 1, avec mises en situation",
      qcm: { src: "qcm.js", cle: "inf5049" } }
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
