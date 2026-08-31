# 🛡️ Fiche Complète de Révision : Sécurisation des Réseaux Locaux (INF5243)

> **Matière :** INF5243 — Majeure Cybersécurité S9 (ESIEA)  
> **Type de document :** Synthèse intégrale de cours oral & Fiche mémo d'examen  
> **Thématiques :** Câblage & Blindage, PoE, Fibre SFP, Trame Ethernet, Modes Wi-Fi, Commutation avancée, MLS, Mémoire CAM/TCAM, VLANs 802.1Q, Attaques VLAN, Zero Trust & Questions Pièges.

---

## 📑 Sommaire
1. [Supports physiques, Blindage, Catégories & Fibre](#1-supports-physiques-blindage-catégories--fibre)
2. [Power over Ethernet (PoE) & Baies de brassage 19"](#2-power-over-ethernet-poe--baies-de-brassage-19)
3. [Trame Ethernet, MTU & Modes Wi-Fi](#3-trame-ethernet-mtu--modes-wi-fi)
4. [Commutation avancée, MLS & Mémoire CAM](#4-commutation-avancée-mls--mémoire-cam)
5. [VLANs 802.1Q, Multi-SSID & Routage Inter-VLAN](#5-vlans-8021q-multi-ssid--routage-inter-vlan)
6. [Sécurité : Les 3 Attaques Majeures sur les VLANs](#6-sécurité--les-3-attaques-majeures-sur-les-vlans)
7. [Zero Trust, Stacking & Administration Sécurisée](#7-zero-trust-stacking--administration-sécurisée)
8. [Fiche Express : Questions & Pièges d'Examen](#8-fiche-express--questions--pièges-dexamen)

---

## 1. Supports physiques, Blindage, Catégories & Fibre

### 1.1 Blindage des paires torsadées (ISO/IEC 11801)
* **Shielded (Tresse métallique) :** Bloque les parasites à **haute fréquence**.
* **Foiled (Feuille d'alu) :** Bloque les parasites à **basse fréquence**.
* **Standard entreprise :** **S/FTP** (tresse de masse globale + écran alu par paire) $\rightarrow$ indispensable pour garantir l'absence d'erreurs en 10G/40G.

> 🎯 **[POINT EXAMEN]** Pourquoi les drivers de cartes réseau suppriment-ils le code correcteur d'erreur de couche 1 ?  
> *Réponse :* Les câbles modernes (S/FTP) et la fibre étant quasi-parfaits, le lourd code correcteur d'erreur de couche 1 (~500 Ko) a été supprimé des drivers (Intel en tête) pour les alléger de 90%. **Conséquence :** un câble défectueux n'est plus corrigé et provoque des latences indémêlables.

### 1.2 Catégories de câbles
* **Cat 5e :** 100 MHz, 1 Gbps (2 paires en 100M, 4 paires en 1G).
* **Cat 6A :** 500 MHz, 10 Gbps sur 100 m $\rightarrow$ **Standard actuel en entreprise**.
* **Cat 7 :** 600 MHz, 10 Gbps $\rightarrow$ Transporte également la TNT (UHF 600 MHz) en habitat (norme RT2012/RE2020) pour remplacer le câble coaxial.
* **Cat 8 :** 2000 MHz, 40 Gbps $\rightarrow$ **30 mètres max** (exclusivement réservé aux **Data Centers** pour relier serveurs et switchs de baie).

### 1.3 Fibre Optique & Modules SFP
* **Cœur monomode :** ~9 µm de diamètre (demi-cheveu).
* **Alignement mécanique :** Tolérance $< 1.5$ Ångström, surfaces planes polies (la moindre impureté génère des pertes d'insertion ou par retour).
* **Coût relatif :** Prise RJ45 = 0,0001 € vs Connecteur optique = 15 € à 40 € (rapport **1 à 1000** $\rightarrow$ raison du maintien du cuivre au poste client).
* **Slots SFP/SFP+ :** Ports modulaires amovibles (LC, SC, optique monomode/multimode ou cuivre).

---

## 2. Power over Ethernet (PoE) & Baies de brassage 19"

### 2.1 Normes PoE (IEEE 802.3)
Le PoE superpose une tension continue (48V) sur les paires Ethernet avec séparation par filtre de découplage capacitif.

| Norme | Type | Puissance Source | Puissance Utile | Applications |
| :--- | :--- | :--- | :--- | :--- |
| **802.3af** | PoE | 15.4 W | 12.95 W | Téléphones IP basiques, caméras fixes. |
| **802.3at** | PoE+ | 30.0 W | 25.5 W | Bornes Wi-Fi 5/6, caméras dôme PTZ motorisées. |
| **802.3bt** | PoE++ (Type 3) | 60.0 W | 51.0 W | Visioconférence, bornes Wi-Fi 6E/7 haute densité. |
| **802.3bt** | PoE++ (Type 4) | **90 W / 100 W** | **71.3 W** | Kiosques, écrans, Smart Building (Tour Montparnasse), haut-parleurs amplifiés. |

### 2.2 Règle normative des 100 mètres & Baie de brassage
* **Baie 19 pouces :** Hauteur mesurée en unités **U** ($1\text{U} = 44.45\text{ mm}$).
* **Règle des 100 m :** **90 m max** de câble rigide dans les murs + **10 m max** de cordons de brassage souples (5m baie + 5m bureau).
* **Règle de raccordement :** On ne peut **jamais sertir** de RJ45 mâle sur un gros câble rigide Cat 6A $\rightarrow$ raccordement obligatoire sur **embase femelle Keystone**.

---

## 3. Trame Ethernet, MTU & Modes Wi-Fi

### 3.1 Structure de la trame Ethernet II
* **Taille :** 64 octets minimum (dont **46 octets de données minimum**) à **1518 octets** (1522 avec tag 802.1Q).
* **Invention d'Ethernet :** **Février 1980** (Comité **IEEE 802** : 80 = 1980, 2 = Février).
* **Pourquoi 46 octets min ?** Requis pour le calcul mathématique du **FCS/CRC32** et la détection de collision CSMA/CD sur 100 m. Si $< 46$ octets $\rightarrow$ **Padding**.
* **Adresses MAC :** Bit de poids faible du 1er octet : **0 = Unicast**, **1 = Multicast / Broadcast**.

### 3.2 MTU & Jumbo Frames
* **Standard :** MTU 1500 octets.
* **Jumbo Frames (9000 octets) :** Multiplie la charge utile sur le LAN, soulage le CPU d'un facteur 6 à 7. Doit être configuré sur **tous** les équipements du segment local (`ip link set eth0 mtu 9000`).

### 3.3 Les 6 Modes Wi-Fi (802.11)
1. **Master / Access Point (AP) :** Gère les clients, autorise l'injection de trames avec MAC forgées.
2. **Managed (Station / Client) :** Mode par défaut des clients.
3. **Repeater (Répéteur) :** Réception sur une fréquence, réémission sur une autre.
4. **Ad-Hoc (IBSS / P2P) :** Liaison directe poste à poste sans point d'accès.
5. **Mesh (802.11s) :** Réseau maillé auto-adaptatif (secours d'urgence, armée).
6. **Monitor :** Écoute passive brute dans les airs (**équivalent du mode Promiscuous**).

---

## 4. Commutation avancée, MLS & Mémoire CAM

### 4.1 Multi-Layer Switch (MLS) vs Routeur
> 💼 **[DÉFINITION ENTRETIEN D'EMBAUCHE]**  
> **« Un MLS est un commutateur dont la décision de commutation dépend des couches 1, 2, 3 et 4. »**

* **MLS :** Inspecte MAC (L2), IP (L3) et ports TCP/UDP (L4) **sans modifier la trame Ethernet** et sans protocoles de routage dynamique.
* **Routeur :** *Démake et remake* l'en-tête L2, gère le routage dynamique (OSPF, BGP, RIP).

### 4.2 Modes de commutation
1. **Store & Forward :** Vérifie le CRC32 (latence ~5 µs).
2. **Cut-Through :** Lit les **6 octets MAC destination** et commute immédiatement (**latence divisée par 5**). Attend le tag sur port Trunk.
3. **Smart Switch :** Démarre en Cut-Through, bascule en Store & Forward si le taux d'erreurs dépasse un seuil.

### 4.3 Mémoire CAM vs RAM
* **RAM classique :** Adresse $\rightarrow$ Donnée.
* **CAM (*Content Addressable Memory*) :** Donnée (Adresse MAC) $\rightarrow$ **Numéro de port en 1 cycle d'horloge**.
* **TCAM (*Ternary CAM*) :** Supporte les masques ternaires pour les règles ACL et routes IP.
* **Apprentissage :** Le switch apprend passivement à la **1ère trame émise** via le champ MAC Source (l'auto-négociation n'envoie aucune adresse MAC).

### 4.4 Stacking & Agrégation LACP/LAG
* **Stacking :** Switchs de **même marque, même modèle et même version de firmware**.
* **LAG / LACP (802.3ad) :** Agrégation de plusieurs câbles (ex: 4x 1G = 4G) pour débit et tolérance aux pannes.

---

## 5. VLANs 802.1Q, Multi-SSID & Routage Inter-VLAN

### 5.1 En-tête 802.1Q (4 octets)
* **TPID (16 bits) :** `0x8100`.
* **PCP (3 bits) :** Priorité QoS.
* **VID (12 bits) :** $2^{12} = 4096$ valeurs $\rightarrow$ **4094 VLANs utilisables** (0 et 4095 réservés).
* **Port Access :** Non tagué (poste terminal).
* **Port Trunk :** Tagué (inter-switchs, borne Wi-Fi, hyperviseur).
* **VLAN Natif :** VLAN non tagué sur le trunk (VLAN 1 par défaut).

### 5.2 Multi-SSID Wi-Fi
Chaque SSID est associé à un VLAN tagué sur le port Ethernet de la borne (ex: `Students` = VLAN 10, `Staff` = VLAN 20, `Guests` = VLAN 30).

### 5.3 Routage Inter-VLAN & Pare-feu
* **Router-on-a-stick :** Lien Trunk unique vers sous-interfaces virtuelles (`eth0.10`, `eth0.20`).
* **Politique de sécurité :** **Default DROP** (tout refuser par défaut, n'ouvrir que les autorisations explicites via `iptables`/`nftables` ou ACLs).

---

## 6. Sécurité : Les 3 Attaques Majeures sur les VLANs

### 1. Reset Physique du Switch (*Switch Resetting*)
* **Mécanisme :** Accès physique au bouton reset $\rightarrow$ retour en configuration d'usine où tous les ports repassent dans le **VLAN 1 par défaut**.
* **Parade :** Sécurité physique stricte des baies de brassage.

### 2. Switch Spoofing (Attaque DTP)
* **Mécanisme :** Trames DTP (*Dynamic Trunking Protocol*) forgées depuis un PC pour négocier un lien Trunk et accéder à tous les VLANs.
* **Parade :** Désactiver DTP sur tous les ports d'accès (`switchport mode access` et `switchport nonegotiate`).

### 3. Double Tagging (*VLAN Hopping*)
* **Mécanisme :** Exploite le fait que le **VLAN natif 1** circule sans tag sur le trunk. Trame forgée avec 2 tags : externe = VLAN 1 natif, interne = VLAN 40 cible. Le 1er switch retire le tag 1, le 2ᵉ switch lit le tag 40 et délivre la trame dans le VLAN cible.
* **Parade :** Ne jamais utiliser le VLAN 1, affecter un VLAN natif dédié inutilisé sur les trunks, et forcer le taggage du VLAN natif (`vlan dot1q tag native`).

---

## 7. Zero Trust, Stacking & Administration Sécurisée
* **Zero Trust (*Never Trust, Always Verify*) :** Authentification continue (802.1X / IAM), micro-segmentation (Private VLANs) et monitoring permanent (NetFlow/SIEM).
* **Management :** Élimination totale de Telnet au profit de **SSH v2** et VLAN d'administration isolé.

---

## 8. Fiche Express : Questions & Pièges d'Examen

| Point Clé | Réponse synthétique attendue |
| :--- | :--- |
| **Taille min/max trame** | **64 o. min (46 o. payload + Padding)** / **1500 o. max** (FCS/CRC32). |
| **Invention Ethernet** | **Février 1980** (Comité **IEEE 802**). |
| **Modes Wi-Fi** | **AP, Managed, Repeater, Ad-Hoc, Mesh, Monitor**. |
| **Définition MLS** | *« Commutateur dont la décision dépend des couches 1 à 4 sans modifier la trame. »* |
| **CAM vs RAM** | CAM inversée : entrée = MAC $\rightarrow$ sortie = **Numéro de port**. TCAM = masques ternaires. |
| **3 Attaques VLAN** | 1. Reset physique $\rightarrow$ Baie verrouillée ; 2. DTP $\rightarrow$ `nonegotiate` ; 3. Double Tagging $\rightarrow$ Changer VLAN natif. |
| **Règle des 100 m** | **90 m rigide** dans les murs + **10 m cordons souples**. |
| **PoE++ 802.3bt** | Jusqu'à **90W/100W** en 48V sur 4 paires. |
