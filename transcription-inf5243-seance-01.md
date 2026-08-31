# Sécurisation des réseaux locaux (INF5243) — Transcription de la séance 1

**Durée totale :** ≈ 3 h 23 (60 + 107 + 36 min) · **3 enregistrements consolidés**
**Fichiers sources :** `Nouvel enregistrement.m4a`, `Nouvel enregistrement 2.m4a`, `Nouvel enregistrement 3.m4a`

> **Sur ce document.** Le texte des trois parties est repris **tel quel** de tes transcriptions, sans
> réécriture : seuls la structure d'ensemble, l'ordre chronologique et le sommaire ont été ajoutés.
> Les horodatages sont **relatifs à chaque enregistrement**, pas à la séance entière.
> L'annexe en fin de document rassemble les points où le cours mérite une précision — elle est de moi,
> pas du cours, et est signalée comme telle.

**Fiche de révision associée :** [`04-inf5243-cours-seance-01.html`](04-inf5243-cours-seance-01.html)

---

## Sommaire

### Partie 1 — Architecture, câblage, fibre, PoE
- Architecture de sécurité, blindage des câbles et catégories Ethernet `[00:00]`
- Suppression du CRC matériel, catégories 6A / 7 / 8 et data centers `[05:14]`
- Fibre optique vs RJ45, normes de câblage RT2012 / RE2020 `[11:18]`
- Câble droit vs croisé, Auto-MDIX, `ethtool` / `mii-tool` `[15:55]`
- L'API MII du noyau et le Power over Ethernet `[24:20]`
- Applications du PoE, smart building et VoIP `[34:00]`
- Baies de brassage 19", règle des 100 m, retour d'expérience LoRaWAN `[42:20]`
- Connecteurs fibre optique (SFP, LC, SC) `[51:20]`

### Partie 2 — Carte réseau, trame Ethernet, Wi-Fi, commutation, VLANs
- Driver, buffer mémoire et capture Wireshark `[00:00]`
- Structure de trame, adresses MAC, padding, origine IEEE 802 `[05:00]`
- Adresses multicast, CDP, Spanning Tree, mode promiscuous `[09:28]`
- Mode monitor Wi-Fi, MTU et jumbo frames `[15:15]`
- Adresses MAC virtuelles (VirtualBox / VMware) `[25:19]`
- Les 6 modes Wi-Fi `[32:45]`
- Hub vs switch, topologie en étoile, core switch `[49:20]`
- Segmentation par VLANs (niveau 1 et niveau 2) `[61:40]`
- Trunking 802.1Q, tagging, routage inter-VLAN `[71:20]`
- Filtrage, pare-feu et Zero Trust `[85:20]`
- **Les 3 attaques VLAN et leurs remédiations** `[96:00]`

### Partie 3 — Après la pause : MLS, CAM, stacking
- MLS vs routeur `[00:00]`
- Auto-négociation, matrices de commutation, jumbo frames `[03:48]`
- Les 3 modes de commutation `[13:05]`
- Mémoire CAM et apprentissage des adresses MAC `[20:28]`
- Stacking, agrégation de liens, management `[31:18]`

### Annexe
- [Précisions et points à vérifier](#annexe--précisions-et-points-à-vérifier)

---

# Partie 1 — Architecture, câblage, fibre, PoE (≈ 60 min)

*Source : `Nouvel enregistrement.m4a`*


### [00:00 - 05:00] Architecture de sécurité, blindage des câbles et catégories Ethernet

**[00:00]** Je vous décris comment les architectures de sécurité sont mises en place, parce que ça, ça fait partie des architectures de sécurité. Et du coup, je vous présente l'architecture de sécurité en règle générale, et ensuite vous aurez déjà vu, vous aurez une vue d'ensemble : vous savez à quel moment on fait de la cybersurveillance, à quel moment... où est-ce qu'on met des pare-feux, où est-ce qu'on met des reverse proxies, où est-ce qu'on met des IDS, des NIDS, des HIDS... Tous ces termes-là, vous les aurez en tête, vous aurez le vocabulaire, vous aurez eu l'architecture avec "ah oui, ça c'est là", et ensuite vous avez des cours dédiés.

**[00:35]** Parce que faire un cours sur un UTM sans savoir où je le fous, ce putain d'UTM, dans l'architecture réseau globale, ça n'a pas de sens. Donc l'objectif du cours, c'est aussi de vous présenter tout ça dans un module complet, sans aller en précision dedans, mais voilà comment ça s'organise. Et ensuite, vous aurez les cours de chaque brique, les unes... mais vous aurez en tête l'architecture.

**[00:59]** Métier très intéressant, l'architecture. Très intéressant, parce que les IA, les automates, savent pas faire. Trop d'informations, il faut trop revenir en arrière à chaque fois : "Ah non, ça c'est plus ça, donc je change ça, donc du coup tout ce que j'avais prévu change." Une IA, quand on lui fait faire ça, ça lui coûte une blinde parce qu'elle revient sur sa décision d'avant, sur ses statistiques d'avant pour reboucler. Et bim ! C'est un ticket à 1000 balles à chaque fois. Donc elle ne le fait pas grandement. Par contre, architecte, penser réseau, en termes de métier, c'est tout sympa.

**[01:38]** Voilà. Donc on commence par le début : quelques rappels pour pouvoir poser le vocabulaire, et ensuite on pourra avancer.

**[01:47]** Bien. Sur le LAN, les câbles qui vous permettent de vous connecter... C'est parti historiquement de câbles qui n'ont pas de protection : *unshielded* et *unfoiled*. Je vous rappelle : *shield*, c'est blindage, on met une tresse de masse autour des câbles Ethernet ; et des fois on vous met un papier alu, comme ça (*foil*). L'un va bloquer les perturbateurs à haute fréquence (*shield*), l'autre va bloquer les perturbateurs à basse fréquence (*foil*).

**[02:23]** En mettant les deux, vous voyez qu'on a une feuille d'aluminium sur les paires torsadées Ethernet (*Twisted Pair*, TP), et ben on va bloquer les perturbateurs basse fréquence. Et ici, avec un blindage tout autour des quatre paires torsadées, on va bloquer les perturbateurs haute fréquence. Ce qui fait qu'aujourd'hui, on peut atteindre des 100 Gigabits en Ethernet, ce qui était complètement utopique au moment où ça avait été inventé ce truc-là, puisque ça a été inventé à 10 Méga.

**[02:58]** Mais grand bien fasse au câble Ethernet, car il a ravagé la planète : tous les autres protocoles réseau LAN ont disparu grâce à l'évolution de la norme Ethernet, et notamment des supports de type câble. Il n'y a pas une entreprise qui n'est pas câblée. Toutes les entreprises câblent. Chez vous, c'est du Wi-Fi parce que la maison est faite comme ça, mais dans les entreprises, ils câblent. Dans les usines, ils câblent. Tout est câblé en fibre ou en paire torsadée.

**[03:28]** Pour reconnaître une paire torsadée, pour reconnaître un câble et savoir comment il est designé (est-ce qu'il est comme ça, comme ça, comme ça ?), il suffit de lire ce qui est marqué sur le câble. C'est marqué dessus. Je vous rappelle que la façon dont ça se lit : on part de la droite, comment est la paire torsadée (Twisted Pair) ? Là, elle est unshielded et unfoiled (il n'y a rien). Et comment est le câble lui-même ? Il est unshielded et unfoiled. Voilà, donc ça, c'est ce câble-là où il n'y a rien, ça s'appelle un câble téléphonique.

**[04:08]** Aujourd'hui, on a essayé toutes les solutions techniques. Déjà il faut que les usines fabriquent ce genre de choses, ce qui est pas simple. C'est plutôt un problème industriel qu'un problème de technologie : comment je produis pas cher ? Aujourd'hui on est sur la dernière des solutions qui est devenue la norme, où on va écanter chaque paire torsadée (donc une feuille d'aluminium au chaud autour de chaque paire torsadée, chaque paire est *foiled*, donc écrantée par un écran aluminium), et l'ensemble du câble (qui contient donc quatre paires torsadées) est *shielded*, donc blindé contre les perturbateurs haute fréquence.

**[04:48]** Et là on a un câble du coup qui ne peut plus percevoir de perturbateurs extérieurs, que ce soit des éruptions solaires, que ce soit le câble d'à côté, que ce soit un data center dans lequel il y a des milliers de câbles... tout ce bruit électromagnétique, tout ça fait que le code Manchester qui passe sur la paire torsadée n'est pas perturbable.

---

### [05:00 - 11:00] Suppression du CRC matériel, catégories 6A / 7 / 8 et Data Centers

**[05:14]** Ça tombe bien, parce que je vous rappelle que les cartes réseau, NIC (*Network Interface Card*), doivent contrôler que sur le câble il n'y ait pas d'erreur. Ça fait partie de la couche 2 du modèle OSI, c'est marqué : la couche 2 doit s'assurer que la couche 1 n'a pas été perturbée. Donc on a un contrôle d'erreur qui doit être réalisé à la couche 2. Ethernet étant la couche 2, le câble étant la couche 1, et ben Ethernet, le protocole lui-même, doit contrôler qu'il n'y a pas eu d'erreur. C'est pour ça que dans la trame Ethernet, il y a un FCS à la fin, le contrôle d'erreur.

**[05:51]** Mais depuis 10 ans, nous n'avons plus d'erreurs grâce à ces câbles-là, grâce à la fibre optique qui est immunisée contre les perturbateurs électromagnétiques. Donc du coup, qu'est-ce que font les développeurs du driver de la carte réseau ? Parce que c'est dans le driver qu'on trouve le code correcteur d'erreur (qui est un code convolutif de détection et de correction d'erreur de la couche 1). Mais s'il n'y a plus d'erreurs, qu'est-ce que je vais me faire chier avec un code très complexe ?

**[06:33]** Ce code correcteur d'erreur, c'est un bon 500 kilo-octets de langage machine. On est dans le driver, là. 500 Ko de langage machine, c'est un sacré programme, un sacré patatras ! Si j'enlève ça, le driver est divisé par 10. Un driver sans ça fait 50 Ko. Et grosso modo, 90% de sa taille était le code correcteur. Vous voyez l'intérêt des développeurs de dire : "S'il n'y a plus d'erreurs à corriger, pourquoi je laisse le code correcteur d'erreur ?"

**[07:07]** Et donc petit à petit, entreprise après entreprise qui construit des cartes réseau et donc des drivers (Intel, etc.), ils ont supprimé les codes convolutifs correcteurs d'erreur de leur carte réseau. Ça a permis au driver d'être allégé de 90%, mais ça a un petit travers : vous DEVEZ mettre des câbles de sacrée bonne qualité, parce qu'il n'y a plus personne qui va contrôler qu'il y a des erreurs. Donc tous les câbles merdiques pas S/FTP, cherchez pas : poubelle.

**[07:51]** Parce que sinon, vous allez être sur des problèmes réseau qui sont indémêlables ! De la latence, du lag, des trucs 'ça marche, ça marche pas'... Il n'y a rien de pire en diagnostic qu'un machin qui marche et qui marche pas. Dès que vous avez des câbles à la con qui ne sont pas S/FTP : poubelle, parce que les cartes ne sont plus capables de faire de l'analyse et de la correction d'erreur. Il n'y a pas une carte réseau dans votre PC aujourd'hui qui a un code correcteur d'erreur. Vous êtes tous avec des chipsets Intel quasiment, et Intel a été le premier à virer ces codes correcteurs d'erreur.

**[08:50]** Cette technologie sous-jacente permet de définir des catégories. L'électricien qui va déployer le réseau dans l'entreprise, faut pas commencer à lui dire "tu me mets un SFTP foiled comme ça", le mec il vous regarde et il comprend pas. Lui, il a appris à installer des câbles où dessus c'est marqué Cat 6, Cat 6A, Cat 7, Cat 8, point barre.


> 🎯 **[POINT EXAMEN] Catégorie 8 :** Pourquoi autorise-t-on moins de 100m ? Exclusivement réservé aux Data Centers (< 30m) pour relier les hyperviseurs.

**[09:44]** Aujourd'hui, il n'y a pas une entreprise qui met moins que du **Cat 6A**. C'est un peu la norme, ça permet de tenir du 10 Gigabits quand même, ce qui est pas mal. Et on a fait une entorse à la norme Ethernet avec le **Catégorie 8** : c'est la première fois qu'on baisse la culotte et qu'on s'autorise à faire moins de 100 mètres ! On est monté en fréquence (40 Gigabits). Pourquoi on s'est autorisé ça ? Parce que l'usage qu'on va faire de ces câbles-là ne fait jamais 100 mètres : c'est les câbles de data center !

**[10:32]** Dans un data center, vous ferez rarement 100 mètres entre les serveurs dans les baies. On n'a pas assez de prises optiques (parce que les prises optiques coûtent très cher mécaniquement), donc on a beaucoup de prises Ethernet et il fallait des vitesses de folie. On l'a fait sur petite distance (moins de 30 mètres), ça correspond au câblage des data centers. Tous les câbles Ethernet dans les data centers modernes sont des câbles de catégorie 8 pour relier les hyperviseurs et les serveurs de stockage.

---

### [11:00 - 18:00] Fibre optique vs RJ45, et normes de câblage dans les bâtiments (RT2012 / RE2020)

**[11:18]** Pourquoi on ne met pas de la fibre partout ? Le câble optique ne coûte rien, il coûte 10 fois moins cher que le câble électrique Ethernet, mais la **prise optique**, c'est juste une tuerie ! Une prise optique déjà n'est pas normalisée : il y a 6 prises optiques différentes qui existent sur la planète (LC, SC, ST, etc.). Ça veut dire que les constructeurs d'équipements ne mettent pas de prise optique : ils mettent des trous (des slots SFP) !

**[11:43]** Et quand vous mettez un câble optique, vous devez acheter le boîtier (le module SFP) qui va se mettre dans le trou, qui correspond à la prise optique que vous voulez, plus la même chose de l'autre côté. Et là, vous êtes en train d'exploser le budget sur un câble, alors qu'un connecteur RJ45 ça coûte 0,0001 dollar pièce contre 17 à 40 dollars pour la prise optique. On est sur un rapport de 1 à 1000 ! Quand vous avez 200 prises à mettre, vous allez plutôt mettre du câble Ethernet électrique.

**[12:22]** Petite particularité dans votre maison : les nouvelles maisons dans la norme **RT2012 / RE2020** (norme de construction des maisons), nous ne mettrons plus de câble coaxial entre l'antenne sur le toit et votre télévision. C'est fini ! Pourquoi ? Parce qu'une paire torsadée Cat 7 (bande passante 600 MHz) est capable de transporter le signal radio de la TNT qui est en UHF à 600 MHz.

**[14:05]** Le coaxial disparaît des maisons ! On prend une paire torsadée de votre câble Ethernet pour faire passer la TNT si vous en avez besoin. On profite de la montée en fréquence du câble.

**[14:50]** Rappel : le signal électrique va moins vite dans le cuivre que la lumière dans la fibre optique (environ 200 000 km/s dans le cuivre contre 300 000 km/s dans le vide / ~200 000-250 000 km/s dans la fibre). Pour traverser l'Atlantique (Europe - USA), c'est de la fibre sous-marine : 99% de la capillarité Internet mondiale, c'est de la fibre optique sous-marine. On ne fait quasiment plus rien par satellite, c'est que du spare. Mais en local, sur le réseau LAN, ça reste le câble électrique qui fait foi.

---

### [18:00 - 24:00] Câble droit vs croisé, Auto-MDIX, et commandes `ethtool` / `mii-tool`

**[15:55]** Câblage : les prises RJ45 sont transparentes pour voir l'ordre des couleurs (norme T568A / T568B). Câble droit vs câble croisé : un câble croisé, c'est entre deux équipements de même nature (PC à PC, switch à switch sans auto-MDIX). On croise l'émission et la réception (la paire 1-2 avec la paire 3-6).


> 🎯 **[POINT EXAMEN / PIÈGE CÂBLAGE]** En 100 Mbps (100BASE-TX), seules 2 paires sont utilisées. En 1 Gbps (1000BASE-T) et plus, les 4 paires sont obligatoires.

**[16:55]** Je vous rappelle qu'on utilise seulement 2 paires torsadées jusqu'à 100 Mégabits (100BASE-TX). À partir de 1 Gigabit (1000BASE-T), **on utilise les 4 paires**. Si vous achetez un câble pas cher où ils n'ont câblé que 2 paires, vous ne dépasserez JAMAIS les 100 Mégabits ! Votre carte basculera en 1 Gbps, verra qu'il manque des paires et se mettra en erreur.

**[17:42]** *[Remarque étudiante sur le câblage maison]* : Si dans une maison on prend 1 paire pour la TNT et 1 paire pour le téléphone, il ne reste que 2 paires pour Ethernet, donc le réseau local de la maison est bridé à 100 Mégabits ! Si vous voulez du Gigabit, il faut dire à l'électricien de ne pas dériver les paires pour la télé/téléphone et de câbler les 4 paires complètes sur la prise RJ45 pour avoir du 1 Gbps.

**[19:54]** Pour ne pas avoir à choisir entre câble droit et câble croisé, on ne produit quasiment plus que des câbles droits aujourd'hui. Pourquoi ? Parce que les cartes réseau modernes intègrent l'**Auto-MDIX** : elles négocient automatiquement le croisement et la vitesse.


> 🎯 **[CAS PRATIQUE D'EXAMEN]** Dépanner une connexion 10 Mbps fixe sans auto-MDIX (automate) : Câble croisé, Hub intermédiaire ou forcer via 'ethtool' / 'mii-tool'.

**[21:12]** Cas concret : vous arrivez dans un laboratoire ou une usine avec un vieil automate industriel (qui date d'il y a 15 ans). Cet automate a un chipset Ethernet des années 80 : il ne sait faire que du 10 Mbps, il ne sait pas croiser tout seul et ne sait pas négocier. Vous branchez votre PC moderne en direct avec un câble droit : rien ne se passe, lien down (`link down`).

**[22:35]** Quelles sont les solutions ?
1. Mettre un vieux **Hub Ethernet** intermédiaire (qui fait répéteur physique).
2. Utiliser un **câble croisé**.
3. Forcer votre carte réseau sous Linux avec `ethtool` ou `mii-tool` pour désactiver l'auto-négociation (`autoneg off`), forcer la vitesse à 10 Mbps (`speed 10 duplex half/full`) et forcer le croisement matériel (`ethtool -s eth0 autoneg off speed 10 duplex full`).

---

### [24:00 - 33:00] L'API MII du noyau et le Power over Ethernet (PoE 802.3af/at/bt)

**[24:20]** Pourquoi `mii-tool` ? MII = *Media Independent Interface*. C'est l'API standardisée dans le noyau pour piloter le contrôleur physique Ethernet.

**[27:00]** Dans les années 2010, Microsoft a dit aux constructeurs de cartes réseau : "C'est fini, vos drivers de cartes réseau ne s'exécuteront plus en Ring 0 (au cœur du noyau) sans contrôle, c'est trop dangereux (plantages écrans bleus, failles)." Microsoft a imposé une couche d'abstraction (NDIS / API standardisée) où le driver propriétaire communique via une API définie par l'OS. Linux a fait de même avec l'API MII.

**[31:15]** **Le PoE (*Power over Ethernet*) :** Le câble Ethernet permet d'alimenter électriquement les équipements distants.
- Comment on fait ? Le signal Ethernet (codage Manchester / bipolaire) oscille autour de 0V (ex: -3V / +3V).
- Si on superpose une tension continue (par exemple 48V ou 12V), le signal Manchester oscille alors entre 9V et 15V (autour de 12V).
- À la réception, un simple filtre électronique (condensateur / self de découplage) sépare le courant continu (pour alimenter l'appareil) du signal logique haute fréquence (les données réseau).

**[32:37]** Évolution des normes PoE (IEEE 802.3) :
- **PoE standard (802.3af) :** 15.4 W (12.95 W disponibles à l'appareil), tension 48V.
- **PoE+ (802.3at) :** 30 W (25.5 W utiles).
- **PoE++ / 4PPoE (802.3bt) :** 60 W (Type 3) et jusqu'à **90 W / 100 W** (Type 4) en utilisant les 4 paires.

**[33:10]** Conséquence sur les switchs : un switch PoE 24 ports délivrant 60W ou 90W par port nécessite une alimentation interne colossale (parfois 1500W à 2000W) avec de gros ventilateurs. Un switch classique non-PoE coûte 100€, le même modèle en PoE++ coûte 800€ à 1500€.

---

### [33:00 - 42:00] Applications du PoE, Smart Building et téléphonie VoIP

**[34:00]** Pourquoi le PoE est indispensable en entreprise ?
- Dans une tour de bureaux (ex: à La Défense avec 6000 bureaux), devoir installer 3 prises de courant 230V par bureau coûte des millions d'euros en câblage électrique et disjoncteurs.
- Avec le PoE, un seul câble Ethernet alimente le téléphone IP, la borne Wi-Fi, la caméra de surveillance, et même l'éclairage LED du bureau !

**[36:55]** **La Téléphonie sur IP (VoIP / ToIP) :**
- Auparavant, un téléphone analogique utilisait une prise RJ11 alimentée en 48V par la ligne France Télécom.
- Avec le passage à la VoIP, si le téléphone avait besoin d'un bloc secteur 230V en plus du câble réseau, c'était ingérable.
- Grâce au PoE, le téléphone IP est branché sur une seule prise RJ45, démarre son mini-Linux embarqué, contacte le serveur IPBX (Asterisk / téléphonie) et fonctionne immédiatement.

**[38:30]** **Écrans publicitaires et Smart Building :**
- Les écrans d'affichage dynamique dans les halls (kiosques) et les haut-parleurs dans les faux plafonds (ex: supermarchés Leclerc, Carrefour) sont désormais alimentés en PoE 90W : ils intègrent un amplificateur audio et reçoivent le flux musical directement par le câble réseau.
- Les vitres intelligentes de la Tour Montparnasse (qui s'opacifient automatiquement avec la lumière du soleil) sont pilotées et alimentées en Ethernet PoE.

---

### [42:00 - 51:00] Baies de brassage 19", règles de câblage et retour d'expérience LoRaWAN

**[42:20]** **Les baies de brassage :**
- Format standard mondial : **19 pouces** de large (les hauteurs sont en "U" : 1U = 1.75 pouce = 4.445 cm).
- À la maison, on utilise des petits coffrets 10 ou 12 pouces.
- Dans une baie, on trouve les bandeaux de distribution (panneaux de brassage où arrivent les câbles des prises murales) et les switchs.


> 🎯 **[RÈGLE NORMATIVE D'EXAMEN]** Règle des 100m : 90m max dans les murs (câble rigide de desserte) + 10m max de cordons souples (5m baie + 5m bureau).

**[43:30]** **La règle des 100 mètres :**
- La longueur maximale d'un lien Ethernet en cuivre est de **100 mètres** :
  - **90 mètres maximum** de câble rigide (monobrin) dans les murs (câble de desserte).
  - **10 mètres maximum** de cordons de brassage souples (patch cords) : 5m côté baie + 5m côté bureau.
- Si un câble dans le mur fait 95 mètres et que vous mettez un cordon de 15 mètres au bureau (total = 110m), le signal s'atténue, des trames sont perdues et la carte réseau va "bagoter" (se connecter/déconnecter en boucle).

**[45:40]** **Retour d'expérience concret : Installation de la passerelle LoRaWAN de l'école**
- Projet étudiant pour installer une passerelle IoT LoRa sur le toit de l'école (réceptionnant 3000 capteurs IoT à 45 km à la ronde, dont 2500 capteurs de température Lactalis).
- Il fallait tirer un câble réseau depuis la salle A47 jusqu'au toit pour alimenter la passerelle en PoE extérieur.
- Problème rencontré par les étudiants : ils ont acheté du gros câble Cat 6A SFTP rigide d'extérieur et ont essayé de sertir directement une fiche mâle RJ45 dessus.
- **Erreur classique :** On ne PEUT PAS sertir une prise mâle RJ45 standard sur un gros câble réseau rigide monobrin Cat 6A/7 ! Les brins sont trop épais pour rentrer dans les guides de la fiche RJ45.
- **Solution professionnelle :** On raccorde le câble rigide sur une embase femelle blindée (**Keystone RJ45**) avec un outil d'insertion/pince de brassage, puis on utilise un cordon patch souple court pour relier l'équipement.

---

### [51:00 - 60:00] Prises et connecteurs Fibre Optique (SFP, LC, SC) et conclusion

**[51:20]** **Retour sur la fibre optique :**
- La fibre optique en elle-même est composée de silice (du sable très pur fondu), matériau abondant et très peu cher.
- Une liaison fibre comporte deux brins : 1 brin Émission (Tx) et 1 brin Réception (Rx).
- La lumière voyage dans le cœur de la fibre par réflexion totale interne.

**[52:30]** **Précision mécanique extrême des connecteurs optiques :**
- Le cœur d'une fibre monomode fait environ 9 micromètres de diamètre (l'épaisseur d'un demi-cheveu).
- Pour connecter deux fibres face à face, l'alignement doit être parfait à moins de 1.5 Angström près, avec des surfaces parfaitement polies et planes.
- Le moindre grain de poussière, une rayure ou un mauvais angle bloque ou réfracte les photons (perte d'insertion et réflectance/perte par retour).
- C'est pourquoi la fabrication et le contrôle qualité des connecteurs optiques coûtent cher (environ 20€ à 60€ le module SFP).

**[56:50]** Sur les switchs d'entreprise et les box fibre (Freebox, Livebox), on utilise des modules amovibles **SFP / SFP+** (Mini-GBIC) : le switch fournit le slot, et l'utilisateur insère le module optique adapté à son type de fibre (monomode longue distance, multimode courte distance, ou cuivre RJ45).

**[60:15]** Fin du cours sur cette première partie.


---

# Partie 2 — Carte réseau, trame Ethernet, Wi-Fi, commutation, VLANs (≈ 107 min)

*Source : `Nouvel enregistrement 2.m4a`*


### [00:00 - 05:00] Fonctionnement matériel, driver, buffer mémoire et capture Wireshark

**[00:00]** La carte réseau elle-même, la NIC (*Network Interface Card*), et puis par le driver, et puis ils ne sont pas fournis à l'OS. L'OS n'en a pas... n'en a pas besoin, c'est pas des infos qui peuvent l'intéresser. Donc c'est... tout ce qui est géré par le driver et la carte.

**[00:15]** Ce qui est fourni à l'OS, c'est un map, c'est une map mémoire, un malloc qui part de là et qui vient ici par rapport à l'entièreté de la trame. OK ? L'OS n'a que ça. Et ensuite on fait... on génère une interruption matérielle, on copie ça dans la zone d'échange du driver. Pouf ! On fait une interruption matérielle pour dire au... à l'OS qu'il y a une trame réseau qui vient d'arriver.

**[00:41]** Cette interruption matérielle enclenche le driver Ethernet du noyau qui vient la lire. C'est aussi simple que ça, et ensuite ça monte dans les couches de l'Ethernet : IP, TCP, bla bla bla... Et on fait comme ça pour toutes les trames.

**[00:55]** La fenêtre d'échange... la fenêtre d'échange, c'est la taille d'échange entre le périphérique et l'OS, elle est constituée d'une quinzaine de trames. À peu près, on peut stocker 15 trames. Si cette fenêtre est pleine, eh ben on est obligé de dire à la carte réseau : temporise. C'est pour ça que les cartes réseau ont de la mémoire, pour temporiser parce que l'OS n'a pas été capable de traiter les trames à la bonne vitesse.

**[01:23]** C'est des choses qui se modifient dans les paramètres noyau, ça, en live. Dans `/proc/sys/net/ipv4/...`, vous changez la taille de la fenêtre d'échange et ça vous permet... Pourquoi je vous en parle ? Parce qu'un jour vous aurez à faire de l'analyse réseau, pour passer une soirée avec moi, sur des zones de réseau à très haut débit. Au-delà du débit, à très haute densité, parce que le débit c'est la vitesse d'une trame, mais le plus important c'est le volume des trames, au-delà de leur vitesse. OK ?

**[01:56]** Et quand la carte réseau... enfin quand votre système ne peut plus accepter d'analyser le réseau parce que ça va trop vite, typiquement vous vous mettez sur une sortie Ethernet d'une entreprise, ça... ça envoie quand même, hein ! Et si vous y foutez... vous arrivez avec votre petit PC, vous mettez la carte pour dire "on va faire un petit coup de Wireshark", là vous ne ferez rien du tout. Vous aurez 1 trame sur 15. Donc votre analyse elle va rapidement avoir quelques petits soucis.

**[02:23]** Donc il y a deux-trois astuces pour essayer de choper 10 trames sur 15 au lieu d'une. La première astuce elle est simple : c'est de dire à Wireshark "arrête de faire de l'analyse en temps réel. Capture, et à la fin de la capture on fera l'analyse." Parce que le fonctionnement de Wireshark à la base, ou de tcpdump, de tshark, tous les outils d'analyse réseau, c'est qu'ils capturent et ils analysent tout, ils décortiquent les 6 couches OSI, et ils essaient de vous les montrer à la vitesse de la lumière. Ça, c'est hyper gourmand.

**[02:57]** Donc comprenez bien qu'il y a déjà une première astuce, c'est de dire "OK, capture, et on fera l'analyse plus tard." Il prend, et puis quand vous faites Stop... clac, il vous montre l'analyse. C'est une option dans la capture : pensez-y, c'est le laps de temps.

**[03:15]** Tout ça, c'est lié à la fenêtre d'échange entre le driver et l'OS, et c'est quelque chose qui est paramétrable. Vous pouvez jouer là-dessus pour être sûr de rien oublier. Vous le verrez tout de suite dans les analyseurs de trames que ça merde, parce que les trames sont numérotées. Et quand vous voyez qu'il y a des numéros qui sautent (1, 2, 3, 8, 9, 10... ah, merde !), ça va trop vite. Donc il faut trouver une astuce pour capturer. La première astuce, c'est de pas analyser en temps réel si c'est pas nécessaire.

**[03:50]** Bon, voilà. Donc la trame, vous l'avez compris : ça c'est mangé par la carte et par le driver, ça par le driver et ça par la carte. On vérifie le calcul du code correcteur d'erreur dans le driver, donc on zappe. Et ça, vous voyez, c'est une horloge : 1 0 1 0 1 0 1 0 1 0... C'est juste pour caler l'horloge de votre carte sur la vitesse de la trame qui arrive, pour que vous puissiez ensuite lire les bits au bon moment, au milieu du bit et pas à la fin, pas au début, pour être certain de lire un 1 ou un 0. Ça synchronise la carte sur la vitesse de la trame.

**[04:24]** Je vous rappelle que vous êtes à la vitesse qui a été négociée entre les deux cartes. Parfois vous êtes à 10 Méga, des fois à 100, des fois à 1000. Donc il faut bien synchroniser pour chaque trame. Rien de particulier : le `1 1` à la fin veut dire Stop, fin du délimiteur, fin du préambule, et on commence la trame comme elle est normalisée en 802.1 / 802.3. C'est le document 802.1, je vous rappelle, le groupe 802 de l'IEEE, premier document : le format de la trame.

---

### [05:00 - 10:00] Structure de trame, adresses MAC, padding et origine IEEE 802

**[05:00]** Source, destination, qu'est-ce que je transporte, et là il y a ce que je transporte. C'est aussi con que ça. La trame Ethernet est l'une des trames les plus simples, c'est l'un des protocoles les plus simples de la planète. On ne peut pas faire plus simple que ça, on ne peut pas faire moins que ça.


> 🎯 **[POINT EXAMEN]** Adresse MAC : bit de poids faible du 1er octet -> 0 = Unicast, 1 = Multicast / Broadcast.

**[05:18]** Vous vous rappelez que dans les adresses MAC, il y a tout un tas de systèmes qui fait que les trois premiers octets définissent le constructeur. Si l'octet ici il est pair, ça a une signification ; s'il est impair, c'est une autre signification, parce que le bit de poids le plus faible de l'octet de poids le plus fort veut dire : est-ce que cette adresse MAC est une adresse Multicast ou est-ce que c'est une adresse Unicast ? C'est bon pour tout le monde ? C'est du rappel, tout ça.

**[05:46]** *[Un étudiant]* : Et pour les données pour faire la correction d'erreur, elles sont là mais...  
**[05:51]** *[Enseignant]* : Elles ne sont pas vérifiées... Ah oui, elles ne sont même pas renseignées à l'émission. Si la carte à l'émission, le driver, il a décidé de pas faire le boulot, 4 octets vides.


> 🎯 **[QUESTION D'INTERRO EXPLICITE DU PROF]** Pourquoi 46 octets min (60-14) et 1500 max ? Padding si < 46 octets, nécessaire au calcul du code correcteur FCS/CRC32 et CSMA/CD.

**[06:05]** Si on vous demande un jour dans une interro : pourquoi 60 octets minimum et 1500 maximum ? 1500 moins les 14 qui sont là. Pourquoi 60 minimum ? Donc 60 - 14 = 46. Pourquoi 46 minimum ? Et s'il n'y a pas 46, on fait quoi ?  
*[Étudiant]* : Du padding.  
*[Enseignant]* : C'est ça. Pad. Ça, vous n'avez jamais vu, mais je vais vous en montrer. Et pourquoi 46 minimum ?

**[06:50]** Pour calculer le code correcteur d'erreur. Pour que ce code fonctionne, il faut un certain volume d'informations. On ne peut pas avoir des erreurs sur 2 bits, vous voyez ce que je veux dire ? Sur 1 octet. Il faut du volume pour faire du calcul, ne serait-ce que le bit de parité. Si on voulait faire un code correcteur d'erreur avec un bit de parité, il faut quand même au moins 10 bits pour que ça ait du sens. Ben là, pour que ces codes-là fonctionnent, il faut un minimum de données pour que la fonction mathématique ait du sens.


> 🎯 **[DATE CLÉ EXAMEN]** Invention d'Ethernet : Février 1980 (IEEE 802 : 80 = 1980, 2 = Février).

**[07:21]** C'est pour ça qu'on a mis un minimum dans les octets, sinon le code ne fonctionnerait pas. Alors aujourd'hui on s'en fout, puisque je vous l'ai dit, les cartes ne veulent plus le faire ! Mais à la base, à l'origine, dans les années... quelles années ça a été inventé Ethernet ?  
*[Étudiants hésitent]* : Faites gaffe, hein ! C'est quoi le groupe IEEE ?  
*[Étudiant]* : 802...  
*[Enseignant]* : Février 1980 ! Bordel ! Ethernet a été inventé en février 1980.

**[08:12]** Donc dans les années 80, toutes les cartes faisaient du code correcteur d'erreur, parce qu'on avait des supports de merde, des paires torsadées qui n'étaient pas blindées, pas écrantées, pas protégées, rien du tout. Donc il y avait des risques d'erreurs liés à l'électromagnétisme, donc il fallait détecter les erreurs et les corriger. D'où la notion de 46 octets minimum pour que cet algorithme fonctionne.

**[08:36]** Il y a des universités qui passent 12 heures à expliquer les 4 codes correctifs... Les codes convolutifs qui sont là, ça n'a pas d'intérêt à part le côté scientifique. Pourquoi 4 ? Parce que dans les années 80, c'était juste un code détecteur d'erreur, un bit de parité. Ensuite quand on est passé à 100 Mégabits, il y a eu un autre code, à 1 Gigabit un autre, et aujourd'hui à 10 Gigabits il y a un 4e code. On a avancé dans le temps, on est meilleur en informatique et meilleur en correction d'erreurs. On ne fait pas juste de la détection, on corrige. Et comme le support est sans défaut aujourd'hui, ça a disparu, au bon vouloir des drivers.

---

### [10:00 - 15:00] Adresses Multicast, protocoles constructeurs (CDP, STP) et mode Promiscuous

**[09:28]** C'est bon pour tout ça ? Unicast, Multicast, c'est bon pour tout le monde ? En Ethernet, le Multicast, c'est une adresse... Je vous rappelle comment ça se passe : si un constructeur sur un réseau local veut fabriquer une trame à destination de tous les équipements de sa marque sur le réseau local, qu'est-ce qu'il fait ? "Moi je m'appelle Cisco, je vends des millions d'équipements sur les réseaux locaux, des switchs, des points d'accès Wi-Fi, des routeurs, des pare-feux, je veux un protocole à moi pour que mes équipements dialoguent ensemble sur un LAN. C'est mon besoin."

**[10:10]** "Et ce protocole, je vais l'inventer moi. Je vais le transporter par Ethernet, parce que je suis sur un LAN, j'ai pas besoin d'IP sur un LAN, je vois bien toutes les machines, les adresses MAC sont là. Eh ben je vais faire mon protocole de dialogue entre mes équipements à moi, pour que mes équipements se reconnaissent, se voient : la marque, le modèle. J'ai envie de faire ça. Eh ben je vais demander à l'IEEE : donne-moi une adresse MAC de Multicast (donc où le bit ici sera à 1), mais à moi, avec mon code constructeur."

**[10:45]** "Et cette adresse-là, qui est une adresse de Multicast, les commutateurs vont l'envoyer à tout le monde. Seuls les équipements qui se reconnaissent (Cisco) la prennent et traitent la data." Ce protocole s'appelle CDP (*Cisco Discovery Protocol*).

**[11:05]** Vous avez compris à quoi ça peut servir, une adresse Multicast ? Un besoin d'un constructeur, le besoin d'un protocole. Le protocole Spanning Tree, qui permet d'éviter les boucles dans un réseau local, fonctionne comme ça : on envoie des trames de Multicast, et tous les switchs se disent 'tiens, ça c'est pour nous les switchs'. Donc ils traitent la data qui est dedans, ce qui leur évite d'avoir des boucles sur un réseau local (genre un switch branché dans un switch, dans le même switch... tic-tac-tic-tac, trames de broadcast, ça écroule le réseau). Donc les commutateurs vont tout seuls détecter la boucle. Ça s'appelle Spanning Tree.

**[12:20]** Donc l'OS... la carte réseau ne laisse passer à l'OS que les trames dont il est destinataire. C'est le but du driver de carte Ethernet : "OK c'est pour moi, je le donne à l'OS. Ah, c'est pas pour moi, je mets à côté." C'est peut-être pour moi carte réseau, pour moi traiter en tant que carte (Spanning Tree c'est traité par la carte réseau, l'OS n'en a rien à battre).

**[13:00]** Exception : je vais remonter à l'OS toutes les trames de Broadcast (`FF:FF:FF:FF:FF:FF`), c'est pour tout le monde, je le donne à l'OS. Les trames de Multicast que moi carte réseau j'ai pas à traiter parce que c'est pas un protocole que je connais, je les file à l'OS aussi (vous les voyez dans Wireshark).

**[13:31]** Et si vous dites à la carte : "Bon, quitte ta logique de donner ou pas donner à l'OS, tu donnes TOUT à l'OS." Ça s'appelle mettre la carte en **mode Promiscuous** (mode promiscuité). C'est un bit qu'on met à 1 dans les paramètres du driver, et le driver donne l'ordre à la carte au firmware en disant : "OK, on fait plus de filtre. Toutes les trames que tu vois sur le câble, tu les files à l'OS, tu les mappes pour que l'OS les voie." En tout cas il les voit, il ne les traitera pas, mais il va les voir.

**[14:05]** C'est pour ça qu'on met souvent sa carte en mode promiscuous quand on fait de la capture. D'ailleurs, vous ne le savez pas, mais Wireshark le fait tout seul. Quand vous lancez Wireshark, il met la carte en mode promiscuous. Alors vous allez me dire : est-ce que ça a vraiment un intérêt ? En fait, assez peu, parce qu'aujourd'hui les switchs, leur boulot c'est de vous envoyer QUE les trames dont vous êtes destinataire, et pas vous envoyer les trames destinées à quelqu'un d'autre. C'est le but d'un switch !

---

### [15:00 - 25:00] Mode Monitor Wi-Fi, MTU et Jumbo Frames

**[15:15]** Quel est l'équivalent du mode promiscuous dans une carte Wi-Fi, dans lequel vous voudriez demander à la carte Wi-Fi : capture tout ce qu'il y a autour de toi, même ce qui ne t'est pas destiné ?  
*[Étudiant]* : Le mode Monitor.  
*[Enseignant]* : Ça s'appelle le **mode Monitor**. Ça porte un autre nom, mais c'est l'équivalent. Le mode promiscuous n'existe pas dans les cartes Wi-Fi, l'équivalent c'est le mode Monitor.

**[19:25]** L'intérêt du padding, c'est que chaque constructeur de carte padde à sa façon. Le but c'est de padder. La norme ne dit pas 'padder avec des 0', on peut padder avec `FF`, avec ce qu'on veut. L'avantage c'est que quand on lit le padding de certaines trames, on peut deviner quel OS est derrière qui a généré ce padding-là. Tel OS padde toujours de la même façon. On peut se dire 'tiens, c'est un Android, tiens c'est du Raspberry, tiens c'est...'

**[20:00]** Pour configurer vos cartes : on commence par un `lspci` ou `lshw`. Vous trouvez toutes les informations liées à votre carte : les capabilities (10M, 100M, Base-T, full/half duplex), le microcontrôleur qui pilote votre carte réseau, à quelle vitesse...

**[22:45]** Avec `ip link show`, je vois comment elle est configurée. Elle a bien un MTU de 1500. Pourquoi elle spécifie son MTU ? 1500 c'est la norme. Pourquoi on pourrait le changer ? Parce qu'on va peut-être pouvoir lui faire faire un peu plus !

**[23:10]** Sur votre réseau local, si vous avez tous les équipements compatibles (à la maison avec votre NAS, vos PC, etc.), et que vous savez que tout le monde est compatible **Jumbo Frame**, vous allez pouvoir étendre la taille de la trame Ethernet de 1500 à **9000 octets**. Mais il faut que TOUS les équipements soient OK.

**[23:36]** Et quand vous pouvez le faire chez vous, ça va vous changer la vie pour ceux qui transfèrent des gros fichiers. Ça démultiplie par 5 ou 6 la vitesse d'Ethernet juste en changeant un paramètre. Mais il faut changer partout. C'est pas facile de le changer sur une télé LG ou Samsung, mais ça marche ! La télé accepte les trames à 9000.

**[24:50]** Et surtout, en termes de processeur : là où le processeur devait traiter 6 trames, il n'en traite plus qu'une ! Ça allège énormément le boulot de traitement.

---

### [25:00 - 32:30] Adresses MAC virtuelles (VirtualBox / VMware) et commandes système

**[25:19]** Qu'en est-il des adresses MAC des VM ? Les 3 premiers octets d'une carte virtuelle VirtualBox, ce sera toujours en `08:00:27`. Dès que vous voyez des trames arriver en `08:00:27`, bim ! C'est du VirtualBox. VMware en a un peu plus de codes constructeur, parce qu'il a fait beaucoup de VM.

**[25:55]** Pour la commande `watch` : `watch ip link show`. `watch` permet de voir une commande, elle reste en tâche de fond et elle est rafraîchie toutes les 2 secondes. Exemple simple : vous voulez changer l'état de votre carte réseau, la passer en auto-négociation on ou off. Vous faites un `watch` de ça sur un terminal, et à côté vous faites `ip link set eth0 down/up`. Et vous allez voir l'état basculer en live.

**[27:34]** Faites gaffe à ça : quand vous lancez une machine virtuelle sur votre PC, ne préjugez pas de l'adresse MAC que cette machine virtuelle va avoir sur le réseau local. Vous ne savez pas si votre voisin va avoir la même adresse MAC que vous sur sa VM à lui aussi ! C'était le cas de toutes les versions de VirtualBox jusqu'à une certaine version, où toutes les cartes réseau avaient la même adresse MAC par défaut !

**[28:05]** Quand ils ont vu que ça foutait un bordel pas possible, notamment dans les écoles où tout le monde lance des machines virtuelles en mode bridge et tout le monde a la même adresse MAC... autant vous dire que c'est le bordel ! Bien sûr, c'est quand la carte est en mode pont (*bridged*), exposée directement sur le réseau local.

**[28:23]** Ne cherchez pas à comprendre : quand vous lancez une nouvelle machine virtuelle, vous allez dans les paramètres de la carte réseau et vous cliquez sur 'régénérer une adresse MAC aléatoire'. Comme ça vous êtes sûr qu'il n'y a pas un voisin qui a la même adresse MAC que vous. Parce que c'est indémêlable en réseau : vous êtes là, ça va pas marcher, des fois ça marche un peu... Avant de trouver que c'est parce qu'il y a un autre gars qui a la même adresse MAC que vous sur sa VM, vous allez bouffer tout votre temps !

---

### [32:30 - 48:30] Les 6 modes Wi-Fi (AP, Managed, Repeater, Ad-Hoc, Mesh, Monitor) et couche radio


> 🎯 **[QUESTION EXAMEN / À SAVOIR PAR CŒUR]** Les 6 modes Wi-Fi : 1. Master/AP, 2. Managed, 3. Repeater, 4. Ad-Hoc (P2P), 5. Mesh (802.11s), 6. Monitor.

**[32:45]** Quels sont les 6 modes du Wi-Fi ? On en a un, c'est Monitor. C'est quoi tous les autres ?
1. **Access Point (AP / Master) :** Quand vous mettez votre carte en mode Access Point, ça autorise la carte à faire de l'injection. C'est-à-dire que la carte va autoriser que vous fabriquiez des trames dont l'adresse MAC n'est pas celle du chipset intégré dessus. C'est tout ce que ça fait, mais c'est beaucoup déjà ! Et derrière, il faut mettre tout un tas de logiciels (un serveur DHCP, un démon hostapd pour gérer les clients et les priorités, un firewall) pour que ça devienne un vrai point d'accès.
2. **Managed :** C'est l'opposé d'AP. Quand vous êtes AP vous gérez des clients, quand vous êtes en mode Managed vous êtes géré par un AP. Vous cherchez un AP qui émet des trames toutes les 300 ms en disant 'je suis un AP, voilà mon nom de réseau, mon SSID'. Et vous allez vous raccrocher à ce réseau-là. C'est le mode par défaut de toutes les cartes Wi-Fi clientes.
3. **Repeater (Répéteur) :** Quand vous achetez un répéteur, qu'est-ce que fait la carte ? Elle prend un flux Wi-Fi sur un canal (en 2.4 GHz ou 5 GHz) et elle va prendre un tiers de la bande passante pour recevoir et répéter sur une autre fréquence. On ne peut pas réémettre sur la même fréquence en même temps au même endroit, ce n'est pas possible ! Donc elle réémet sur un autre canal. Toutes les cartes ne savent pas le faire, car il faut que le récepteur fonctionne en même temps que l'émetteur en permanence.
4. **Ad-Hoc :** C'est le mode peer-to-peer (point à point). On n'a plus de manager entre nous, on communique directement deux à deux. C'est le mode le plus efficace qui existe : vous avez toute la bande passante pour vous et l'autre. Sauf que tout un tas de constructeurs ont supprimé ce mode des drivers, car ça faisait tellement peur aux opérateurs télécoms que les gens créent leur propre réseau maillé d'infrastructure sans payer d'abonnement.
5. **Mesh (802.11s) :** Le mode réseau maillé. Chaque nœud scanne, crée une cartographie et relaie les paquets de façon dynamique (avec des protocoles comme OLSR ou AODV). Très utilisé pour les réseaux de secours (sécurité civile, armée, zones de catastrophe).
6. **Monitor :** Écoute passive brute de toutes les trames radio sur une fréquence donnée sans s'associer à un point d'accès.

**[47:15]** Ne dites pas que le Wi-Fi c'est Ethernet ! Dites plutôt : le Wi-Fi transporte des trames Ethernet. Ethernet c'est sur du filaire, sur de la fibre. Le Wi-Fi, c'est de la radio qui transporte une trame Ethernet.

---

### [48:30 - 61:30] Hub vs Switch, topologie étoile et dimensionnement Core Switch

**[49:20]** Le **Hub** : techno qui n'existe plus aujourd'hui. Le hub prend une trame émise par quelqu'un et la répète partout sur tous les ports (répéteur niveau 1). Problème de confidentialité (tout le monde voit tout) et problème de performance (collisions, saturation dès 10 Mbps).

**[50:20]** Le **Switch (Commutateur)** : équipement de niveau 2 doté d'une matrice de commutation. Il lit l'adresse MAC de destination et envoie la trame uniquement sur le port où se trouve le destinataire.

**[51:00]** Combien de commutateurs on peut mettre en cascade ? Si on fait une topologie en arbre ou en cascade sans fin, on crée des goulots d'étranglement énormes. La norme recommande une **topologie en étoile** avec un **Core Switch** au centre.

**[53:20]** Dans un réseau LAN, il faut penser comme en **plomberie** : on met des gros tuyaux (fibres 10G/40G) là où il y a besoin de beaucoup d'eau (vers le Data Center, Active Directory, NAS, passerelle Internet), et des petits tuyaux vers les postes de travail clients (1G ou 100M).

**[57:15]** Pour le switch central (Core Switch), on choisit le switch qui a la matrice de commutation la plus véloce en termes de paquets par seconde (Mpps/Gpps) et on le place au cœur de l'étoile. Tous les switchs d'étage viennent s'y raccorder directement.

---

### [61:30 - 74:30] Segmentation par VLANs (Niveau 1 vs Niveau 2)

**[61:40]** Pourquoi segmenter avec des **VLANs** (*Virtual Local Area Networks*) ?
1. Pour séparer les entités de l'entreprise (RH, R&D, direction, production, invités).
2. Pour la sécurité : faire des caissons étanches comme dans un sous-marin. Si un poste est infecté ou attaqué dans un VLAN, l'attaque est confinée dans ce caisson.
3. Pour réduire les domaines de diffusion (*Broadcast*).

**[65:10]** **VLAN de niveau 1 (par port) :** On affecte physiquement un port du switch à un VLAN ID. Problème : si un utilisateur se déplace avec son PC portable dans une autre salle et se branche sur une autre prise, il n'est plus dans son VLAN et ne peut plus accéder à ses ressources sans intervention d'un administrateur.

**[69:10]** **VLAN de niveau 2 (par adresse MAC) :** Le switch inspecte l'adresse MAC de la machine qui se branche et lui affecte automatiquement son VLAN, peu importe sur quel port elle est branchée. Très pratique pour la mobilité, mais nécessite une gestion stricte des adresses MAC.

---

### [74:30 - 85:00] Trunking 802.1Q, Tagging, Core Switch MLS et Routage inter-VLAN

**[71:20]** Comment propager les VLANs d'un switch à un autre ? On ne va pas tirer un câble par VLAN entre chaque switch ! On utilise un seul câble configuré en **Trunk (Norme IEEE 802.1Q)**.


> 🎯 **[POINT EXAMEN]** Tag 802.1Q : 4 octets, 12 bits de VLAN ID = 4096 VLANs (4094 utilisables : 0 et 4095 réservés).

**[74:35]** **Le Tag 802.1Q :** On insère 4 octets dans la trame Ethernet :
- TPID (`0x8100`)
- Priorité (3 bits)
- **VLAN ID sur 12 bits** $\rightarrow$ ce qui permet d'avoir $2^{12} = 4096$ VLANs possibles (de 0 à 4095).

**[78:55]** Sur le Wi-Fi, on propage les VLANs en associant chaque VLAN ID tagué sur le port de la borne à un **SSID** différent (ex: SSID "Étudiants" sur VLAN 10, SSID "Profs" sur VLAN 20, SSID "Invités" sur VLAN 30).

**[81:50]** Vocabulaire :
- **Port d'accès (*Access Port*) :** Port non tagué relié à une machine finale.
- **Port Trunk / Tagué (*Trunk Port*) :** Port qui transporte plusieurs VLANs avec leurs tags 802.1Q entre switchs ou vers un routeur/hyperviseur.

**[83:00]** **Routage Inter-VLAN :** Par définition, deux machines dans des VLANs différents ne peuvent pas communiquer au niveau 2. Pour les faire communiquer de manière contrôlée, il faut un équipement de niveau 3 : soit un routeur externe (*Router-on-a-stick*), soit un commutateur de niveau 3 / MLS (*Multi-Layer Switch*).

---

### [85:00 - 96:00] Filtrage, Pare-feu (Netfilter, iptables, nftables) et Zero Trust

**[85:20]** Si on met un routeur qui laisse tout passer entre les VLANs, on détruit tout l'intérêt des VLANs ! Il faut donc associer le routage à un **Pare-feu (Firewall)**.

**[86:10]** Sous Linux, le pare-feu est directement intégré dans le noyau via **Netfilter**, configuré avec des outils comme **iptables** ou **nftables**. Chez Cisco, on utilise des **ACLs** (*Access Control Lists*).


> 🎯 **[RÈGLE D'OR FIREWALL]** Règle de base : Default DROP (tout interdire par défaut et n'autoriser que les flux explicites).

**[87:40]** Règle fondamentale de sécurité : **Tout interdire par défaut (*Default DROP*)**, et ne créer que des règles d'autorisation explicites très précises (ex: autoriser uniquement la machine A à faire du SSH port 22 vers le serveur B).

**[94:05]** **Le modèle Zero Trust / Micro-segmentation :**
- Postulat : "Ne faire confiance à personne, toujours vérifier".
- Aucune machine n'a de passe-droit sur le réseau interne.
- Authentification continue (IAM), micro-segmentation (VLANs très restreints, règles d'accès fines machine par machine) et monitoring permanent.

---

### [96:00 - 107:00] Attaques sur les VLANs & Remédiations


> 🎯 **[QUESTION D'EXAMEN DU PROF - 3 ATTAQUES VLAN]** 1. Reset physique switch -> sécuriser la baie ; 2. Switch spoofing DTP -> disable DTP ; 3. Double Tagging -> changer VLAN natif 1.

**[96:00]** Il existe 3 grandes techniques d'attaque sur les VLANs :

1. **Attaque par Reset physique Usine (96:40) :**
   - Si l'attaquant accède physiquement à la baie de brassage, il maintient le bouton reset du switch pendant quelques secondes. Le switch redémarre avec la configuration d'usine où tous les ports sont dans le VLAN par défaut (VLAN 1). La segmentation saute instantanément.
   - *Remédiation :* Sécurité physique stricte des locaux techniques et des baies de brassage.

2. **Attaque par négociation DTP (*Dynamic Trunking Protocol*) (98:40) :**
   - DTP est un protocole propriétaire Cisco permettant à deux switchs de négocier automatiquement un Trunk.
   - Si un port d'accès a DTP activé par défaut, un attaquant envoie des trames DTP forgées depuis son PC pour faire croire au switch qu'il est un autre switch. Le port bascule en Trunk, et l'attaquant a accès à tous les VLANs du switch.
   - *Remédiation :* Désactiver explicitement DTP sur tous les ports d'accès (`switchport mode access` et `switchport nonegotiate`).

3. **Attaque par Double Taggage (*Double Tagging / VLAN Hopping*) (101:45) :**
   - Exploite le fonctionnement du **VLAN Natif** (le VLAN non tagué sur un lien Trunk, généralement le VLAN 1 par défaut).
   - L'attaquant forge une trame avec deux tags 802.1Q superposés :
     - Tag externe = VLAN 1 (VLAN natif du trunk).
     - Tag interne = VLAN 40 (le VLAN cible de la victime).
   - Le premier switch reçoit la trame, voit le tag VLAN 1 (natif), retire ce premier tag et envoie la trame non taguée sur le lien Trunk. Le second switch reçoit la trame, lit le deuxième tag (VLAN 40) et délivre la trame dans le VLAN 40 cible !
   - *Remédiation :* Ne jamais utiliser le VLAN 1 par défaut, changer l'ID du VLAN natif sur les trunks pour un VLAN dédié inutilisé, et forcer le taggage du VLAN natif (`vlan dot1q tag native`).

**[106:15]** Fin de la première partie du cours et départ en pause.


---

# Partie 3 — Après la pause : MLS, mémoire CAM, stacking (≈ 36 min)

*Source : `Nouvel enregistrement 3.m4a`*


### [00:00 - 05:00] Définition du Multi-Layer Switch (MLS) vs Routeur

**[00:00]** Pour que vous le sachiez et que vous puissiez le ressortir un jour : un commutateur pur, c'est un équipement de niveau 2. Ça s'appelle un **MLS** (*Multi-Layer Switch*) dès que dedans on fout du pare-feu, du routage, etc.


> 💼 **[QUESTION TYPE ENTRETIEN D'EMBAUCHE]** Définition MLS : Commutateur dont la décision dépend des couches 1 à 4, sans modifier la trame Ethernet ni exécuter de protocoles de routage dynamique.

**[00:14]** Je vous rappelle la différence entre un routeur et un MLS :
- Si on vous pose la question en entretien d'embauche : *"Qu'est-ce qu'un MLS ?"*, la réponse la plus adéquate est la suivante :  
  **"C'est un commutateur dont la décision de commutation dépend des couches 1, 2, 3 et 4."**

**[00:55]** La décision de commutation : le fait de prendre une trame et de décider sur quel port on va la mettre.
- Un switch normal regarde juste : adresse MAC Source et adresse MAC Destination. C'est tout.
- Un MLS prend la trame, regarde l'adresse MAC Destination toujours, **mais on rentre dans la data** : on est capable d'aller voir les adresses IP (Source et Destination) et les ports TCP/UDP pour savoir si le protocole est autorisé ou pas.
- Mais c'est toujours un switch : c'est bien une matrice de commutation qu'il y a dedans, **ce n'est pas du routage**.

**[01:44]** Quelle est la différence fondamentale avec un routeur ?
- **Un routeur :** Il prend un paquet IP, retire l'en-tête Ethernet de la trame entrante (il "démake" la trame), recalcule un nouvel en-tête Ethernet (il "remake" avec une nouvelle adresse MAC source et destination), et renvoie le paquet sur un autre réseau local.
- **Un MLS / Switch :** Il prend la trame, **il ne la touche pas**, et il l'envoie ou pas au bon endroit en fonction des critères qu'on lui a donnés (adresses IP, ports TCP/UDP). La trame reste telle qu'elle était avant.

**[02:40]** Deuxième différence fondamentale : un routeur comprend et échange des **protocoles de routage dynamique** (OSPF, BGP, RIP, RIPv2, IS-IS) pour construire dynamiquement des tables de routage avec les autres routeurs de la planète. Un MLS ne gère pas de protocoles de routage dynamique : son boulot, c'est de commuter à très grande vitesse.

---

### [05:00 - 13:00] Mécanisme de l'Auto-négociation, Matrices de commutation et Jumbo Frames

**[03:48]** **Comment fonctionne l'auto-négociation électronique ?**
- C'est de l'électronique basique : on envoie des impulsions codées rapides (Fast Link Pulses - FLP), un peu comme du morse : `ti-ti-ti, ti-ti, ti-ti...`
- L'autre carte en face reçoit ces impulsions, comprend ce que l'autre propose (vitesse, full/half duplex), et répond avec ses propres capacités.
- Il n'y a **aucune trame**, aucun début de trame, aucune data ni aucune adresse MAC échangée pendant l'auto-négociation. C'est du pur signal électrique de niveau 1.

**[05:05]** **Qu'est-ce qui fait qu'un switch coûte cher ou pas ?**
- C'est le nombre de trames qu'il est capable de commuter **en même temps** (sa matrice de commutation interne / *Switching Fabric*).
- Un switch basique grand public (comme celui d'une box Internet) a une seule matrice : il traite les trames les unes après les autres. Si deux trames arrivent en même temps, la deuxième attend en mémoire tampon que la première soit sortie.
- Un switch haut de gamme (ex: Alcatel-Lucent OmniSwitch à 4096 ports) intègre 16 matrices de commutation en parallèle : il peut commuter 16 trames simultanément sans aucune attente. C'est pour cela que deux switchs de cœur de réseau peuvent coûter 300 000 €.

**[07:22]** **Jumbo Frames (MTU 1500 vs 9000 octets) :**
- La taille standard d'une trame Ethernet est fixée à 1500 octets de données depuis 1980 (calculé à l'époque pour des liens à 10 Mbps sur 100 mètres).
- Aujourd'hui, avec des débits de 10 Gbps et des processeurs rapides, découper de gros flux en paquets de 1500 octets surcharge inutilement le CPU en interruptions.
- Avec les **Jumbo Frames**, on augmente la taille des trames jusqu'à **9000 octets** (ex: 8960 octets de payload).
- Conséquence : pour un transfert de fichier (FTP, NAS, sauvegardes), le CPU et le switch travaillent 6 à 7 fois moins, car il y a 6 à 7 fois moins de paquets à traiter pour le même volume de données !
- *Attention :* Les Jumbo Frames ne fonctionnent que sur le réseau local (LAN). Dès qu'un paquet sort sur Internet ou passe par une box/routeur, il repasse en MTU 1500 standard (voire moins sur des liaisons satellite comme Starlink où le MTU est réduit pour éviter de perdre de gros paquets lors des perturbations radio).

---

### [13:00 - 20:00] Les 3 modes de commutation : Store & Forward, Cut-Through et Smart Switch


> 🎯 **[POINT EXAMEN]** 3 modes de commutation : Store & Forward (vérifie CRC), Cut-Through (commute dès 6 octets MAC, divise latence par 5), Smart Switch adaptatif.

**[13:05]** Comment un commutateur traite les trames en interne ?

1. **Store and Forward (Stockage et retransmission) :**
   - Le switch reçoit l'intégralité de la trame, la stocke en mémoire tampon (pendant environ 5 microsecondes), recalcule le code correcteur d'erreur (FCS/CRC32) à la fin de la trame.
   - Si le CRC est valide, le switch commute la trame. Si le CRC est faux, il jette la trame immédiatement.
   - *Inconvénient :* Latence plus élevée (le switch doit attendre la fin de la trame avant de commencer à l'envoyer).

2. **Cut-Through / Fast-Forward (Commutation à la volée) :**
   - Comme la qualité des câbles modernes évite les erreurs, les switchs modernes lisent uniquement les **6 premiers octets** (l'adresse MAC de destination qui arrive en tête de trame).
   - Dès que le switch a lu ces 6 octets, il prend immédiatement sa décision de commutation et commence à réémettre les bits sur le port de sortie avant même que le reste de la trame ne soit entièrement reçu !
   - *Avantage :* La latence est divisée par 5.
   - *Inconvénient :* Si la trame est corrompue plus loin, le switch la transmet quand même.

3. **Smart Switch / Commutation Adaptative :**
   - Inventé par Cisco : le switch démarre par défaut en mode *Cut-Through* ultra-rapide.
   - En tâche de fond, il échantillonne une trame sur mille pour vérifier le CRC.
   - Tant qu'il n'y a pas d'erreur, il reste en *Cut-Through*. Dès que le taux d'erreurs dépasse un seuil configuré par l'administrateur, le switch bascule automatiquement en mode *Store and Forward* pour filtrer les trames corrompues, puis revient en *Cut-Through* quand le réseau redevient stable.

---

### [20:00 - 30:00] Mémoire CAM / TCAM et Apprentissage des adresses MAC


> 🎯 **[POINT EXAMEN]** Mémoire CAM vs RAM : Fonctionnement inversé (entrée = Donnée/MAC -> sortie = Numéro de port en 1 cycle d'horloge).

**[20:28]** **La Mémoire CAM (*Content Addressable Memory*) :**
- La table d'adresses MAC d'un switch n'utilise pas de la mémoire RAM ou ROM classique.
- Dans une RAM classique, on donne une **adresse mémoire** et elle renvoie la **donnée** stockée à cet endroit.
- Dans une **CAM**, le fonctionnement est inversé : on lui donne la **donnée** (ex: l'adresse MAC destination `00:11:22:33:44:55`) et la mémoire renvoie instantanément en 1 seul cycle d'horloge l'**adresse/numéro de la case** (qui correspond au **numéro de port** du switch !).
- C'est ce composant matériel ultra-rapide qui permet aux switchs de commuter des millions de trames par seconde sans ralentissement.

**[22:00]** **Comment le switch apprend-il les adresses MAC ?**
- Lors du branchement d'un câble (auto-négociation), le switch n'apprend aucune adresse MAC.
- Le switch est totalement passif : il attend que la machine connectée émette sa **première trame réseau** (ex: requête DHCP, requête ARP).
- Dès qu'une trame entre sur le port 3, le switch lit l'**adresse MAC Source** de la trame et écrit dans sa table CAM : `Port 3 = MAC_Machine_A`.

**[27:05]** **Comportement du switch face aux différents types de trafic :**
- **Unicast connu :** L'adresse MAC destination est dans la table CAM $\rightarrow$ la trame est envoyée uniquement sur le port associé.
- **Broadcast / Multicast :** La trame est dupliquée et envoyée sur tous les ports actifs du même VLAN (sauf le port émetteur).
- **Unicast Inconnu (*Unknown Unicast Flooding*) :** Si la machine cible n'a pas encore émis de trame et que son adresse MAC n'est pas dans la CAM, le switch transfère la trame sur tous les ports du VLAN par sécurité. C'est pourquoi un attaquant peut saturer un switch en envoyant des trames forgées avec des milliers de fausses adresses MAC pour forcer le switch à inonder tous les ports (*MAC Flooding*).

---

### [30:00 - 36:00] Stacking de switchs, Agrégation de liens (LACP/LAG) et Management


> 🎯 **[POINT EXAMEN]** Stacking de switchs : Même marque, même modèle et MÊME VERSION DE FIRMWARE.

**[31:18]** **Le Stacking (Empilement de switchs) :**
- Un switch d'entreprise haut de gamme coûte cher (de 10 000€ à 500 000€).
- Quand une entreprise a besoin de plus de ports, au lieu de racheter un switch gigantesque, elle relie plusieurs switchs identiques entre eux via des câbles de fond de panier haute vitesse dédiés (*StackWise* / *VSS*).
- Les switchs empilés fusionnent leurs matrices de commutation et partagent une seule adresse IP de management : pour l'administrateur, ils se comportent comme un seul et unique gros switch logique.

**[32:36]** **L'agrégation de liens (LAG / LACP - IEEE 802.3ad / 802.1AX) :**
- Permet de regrouper plusieurs câbles physiques Ethernet (ex: 4 liens de 1 Gbps) entre deux switchs ou entre un switch et un serveur pour former une seule liaison logique de 4 Gbps.
- Assure à la fois la multiplication de la bande passante et la tolérance aux pannes (redondance si un câble est débranché).

**[33:40]** **Management sécurisé des switchs :**
- Élimination totale de **Telnet** (mots de passe en clair) au profit de **SSH** avec clés cryptographiques.
- Les switchs modernes intègrent un mini-OS (Linux embarqué) dédié uniquement à l'interface de gestion (CLI, interface Web HTTPS, SNMPv3).
- **Gamme Cisco / Linksys :** Cisco intègre souvent les mêmes puces et fonctions avancées (VLANs, QoS, 802.1X, LACP) dans ses switchs grand public/PME Linksys que dans ses gros switchs d'entreprise Catalyst, ce qui permet de réaliser des architectures très complètes à coût réduit.

**[36:00]** Fin de la séance.


---

# Annexe — Précisions et points à vérifier

> **Cette annexe n'est pas du cours.** Elle relève les endroits où l'énoncé du transcript est
> imprécis, simplifié ou contredit par la norme. Le principe pour l'examen est simple : **réponds ce
> que ton enseignant attend**, mais sache pourquoi c'est discutable — c'est souvent là que se
> jouent les questions de cours et les entretiens.

> ### ⚠️ Mise à jour après réception des supports officiels
> Les planches de Richard Rey (`Network-reminders`, `switch`, `vlan`) **tranchent plusieurs points**
> que j'avais signalés d'après le seul enregistrement. Trois de mes remarques initiales étaient
> mal calibrées :
>
> 1. **Taille de trame** — la planche écrit explicitement **« Minimum 60 bytes / Maximum 1514
>    bytes »** et justifie la convention : *le FCS n'est jamais affiché par les logiciels d'analyse
>    de trames*. Ce n'est donc pas une approximation, c'est un choix documenté et cohérent.
>    Le « 1500 » entendu à l'oral désignait les **données**, pas la trame.
> 2. **Connecteurs optiques** — le support donne les vraies métriques : **perte d'insertion
>    < 0,1 dB**, **perte de retour > 40 dB (PC) / > 50 dB (EAR)**, mesurées à la fabrication. Elles
>    remplacent avantageusement le « 1,5 Angström » de l'oral.
> 3. **Latences de commutation** — chiffrées sur la planche : **Store & Forward 5 à 50 µs**,
>    **Cut-Through 1 à 10 µs**, **routeur 100 µs à 1 ms**. Ma remarque « 5 µs est un ordre de
>    grandeur » était juste, mais le support est plus précis que je ne le supposais.
>
> **Un écart nouveau apparaît en revanche** : l'oral ne cite que **2 niveaux de VLAN**, la planche
> en définit **3** (L1 par port, L2 par MAC, **L3 par plan d'adressage IP**). Le niveau 3 est celui
> qui porte le piège : *« the partitioning is logical only (no security) »*.

## 1. Chiffres de la trame Ethernet — le plus important

| Le cours dit | La norme dit | Ce qu'il faut savoir |
|---|---|---|
| « 60 octets minimum » | **64 octets minimum, FCS inclus** | 46 (données) + 14 (en-tête) + 4 (FCS) = 64. Le « 60 » du cours correspond à la trame **sans le FCS**. Si une question demande « taille minimale d'une trame Ethernet ? », la réponse attendue est en général **64**. Précise ta convention en copie. |
| « 1500 maximum » | **MTU = 1500 octets de charge utile**, trame max **1518** (1522 avec tag 802.1Q) | 1500 est la charge utile, pas la trame. Ne pas écrire « la trame fait 1500 octets max ». |
| « 1500 moins les 14 qui sont là » | — | Formulation ambiguë du transcript : les 14 octets d'en-tête s'**ajoutent** aux 1500, ils ne s'en retranchent pas. |

Le raisonnement du cours sur le **padding** est en revanche exact et vaut la peine d'être retenu tel
quel : il faut un volume minimal de données pour que le calcul du FCS ait un sens (et,
historiquement, pour que la détection de collision CSMA/CD fonctionne sur 2 500 m de câble).

## 2. La date d'invention d'Ethernet

Le moyen mnémotechnique du cours — « 802 → 80 = 1980, 2 = février » — désigne le **lancement du
projet IEEE 802**, en février 1980. Ce n'est pas la date d'invention d'Ethernet.

- **1973** — invention chez Xerox PARC par **Robert Metcalfe** et David Boggs.
- **1980** — publication de la spécification **DIX** (DEC-Intel-Xerox), Ethernet II.
- **1983** — première norme **IEEE 802.3**.

À l'examen, si la question est posée avec le moyen mnémotechnique, réponds **février 1980** ; mais si
on te demande « qui a inventé Ethernet et quand », c'est Metcalfe, en 1973.

## 3. 802.1 ou 802.3 pour le format de la trame ?

Le transcript attribue le format de trame au « document 802.1 ». C'est **802.3** qui normalise la
trame Ethernet et les couches physiques. Le groupe **802.1** traite de l'architecture, du pontage et
de tout ce que tu connais déjà : **802.1Q** (VLAN), **802.1X** (contrôle d'accès), **802.1D/w/s**
(Spanning Tree), **802.1AX** (agrégation), **802.1AE** (MACsec).

## 4. Le MLS — la simplification la plus risquée

Deux affirmations du cours sont pédagogiquement utiles mais fausses en pratique :

- **« Un MLS ne gère pas de protocoles de routage dynamique. »** Les commutateurs de niveau 3
  modernes (Catalyst, Nexus, Arista, OmniSwitch) font tourner OSPF et BGP sans difficulté. La
  distinction historique switch/routeur s'est largement effacée.
- **« Le MLS ne touche pas la trame. »** Vrai quand il commute en couche 2 avec des ACL de niveau
  3/4. Faux dès qu'il **route** entre VLANs : il réécrit alors les adresses MAC source et
  destination et décrémente le TTL, exactement comme un routeur.

La formulation défendable : *un MLS commute en matériel (ASIC) à très haut débit et prend ses
décisions sur les couches 2 à 4 ; un routeur est optimisé pour l'interconnexion de réseaux
hétérogènes et le routage dynamique à grande échelle.*

## 5. Autres points

| Point | Précision |
|---|---|
| « les 6 couches OSI » | Le modèle OSI en compte **7**. Lapsus ou artefact de transcription. |
| « Spanning Tree est traité par la carte réseau » | STP est traité par les **commutateurs** (fonction de pont). La carte réseau d'un poste ne participe pas à STP — elle reçoit les BPDU et les ignore. |
| « Le mode promiscuous n'existe pas en Wi-Fi » | Il existe, mais il ne montre que le trafic du BSS auquel on est associé, et seulement s'il est déchiffrable. Le **mode monitor** est plus puissant : il capture tout le trafic radio d'un canal, trames de gestion comprises, sans association. L'assimilation faite en cours est une simplification acceptable. |
| Modes de commutation | Le cours en donne 3. Il en existe un 4ᵉ classique : **fragment-free**, qui attend les 64 premiers octets pour écarter les trames issues d'une collision. |
| « Store and forward ≈ 5 µs » | Ordre de grandeur seulement : la latence dépend de la taille de la trame et du débit (une trame de 1518 octets met ≈ 12 µs à être reçue à 1 Gb/s). |
| « Les jumbo frames multiplient la vitesse par 5 ou 6 » | Ce qui est divisé par ~6, c'est le **nombre de trames** et donc la charge CPU et les interruptions. Le gain en débit réel dépend du goulot d'étranglement et est généralement bien plus modeste. |
| « Alignement des fibres à 1,5 Angström » | 0,15 nm est une échelle **atomique**, mécaniquement impossible. Les tolérances réelles d'alignement de cœurs monomodes sont de l'ordre du **dixième de micromètre** (sub-micron) — ce qui reste extrêmement exigeant et justifie le prix des connecteurs. |
| « OmniSwitch à 4096 ports » | Aucun châssis n'atteint ce nombre de ports ; les plus gros modulaires plafonnent à quelques centaines. Le chiffre concerne plus vraisemblablement la capacité de la matrice. L'idée à retenir — le prix d'un switch vient du nombre de trames commutables **simultanément** — est juste. |
| « Le mode Ad-Hoc a été retiré sous la pression des opérateurs » | Anecdote invérifiable. Le mode IBSS est effectivement peu supporté aujourd'hui, principalement pour des raisons techniques : pas de QoS, pas de débits 802.11n/ac. |

## 6. Ce qui est confirmé et bon à retenir tel quel

Le reste du cours est exact et souvent plus concret que les manuels : la logique
*shield / foil*, les catégories 6A / 7 / 8 et la dérogation aux 100 m pour les data centers, la
règle **90 m + 2 × 5 m**, les seuils PoE (15,4 / 30 / 60 / 90 W), le principe de la superposition
d'une tension continue sur le signal Manchester, le fonctionnement de la mémoire **CAM** (donnée en
entrée → numéro de port en sortie, en un cycle d'horloge), l'apprentissage sur l'**adresse MAC
source**, l'inondation de l'*unknown unicast* et son exploitation par le **MAC flooding**, les
2 paires jusqu'à 100 Mb/s contre 4 paires à partir du Gigabit, l'OUI `08:00:27` de VirtualBox, et
surtout les **trois attaques VLAN** avec leurs remédiations.

