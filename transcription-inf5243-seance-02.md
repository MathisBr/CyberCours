# INF5243 — Sécurisation des réseaux locaux — Transcription de la séance 2

**Durée cumulée :** 4 h 34 min 29 s · **5 enregistrements consolidés**
**Fichiers sources :** `Nouvel enregistrement.m4a`, `Nouvel enregistrement 2.m4a`, `Nouvel enregistrement 3.m4a`, `Nouvel enregistrement 4.m4a`, `Nouvel enregistrement 5.m4a`

> **Sur ce document.** Le texte des cinq parties est repris **tel quel** des transcriptions, sans réécriture : seuls la structure d'ensemble, l'ordre chronologique et le sommaire ont été ajoutés.
> Les horodatages sont **relatifs à chaque enregistrement**, pas à la séance entière.
> Les encadrés 💡 et 🎯 sont ceux des transcriptions d'origine.

**Fiche de révision associée :** [`05-inf5243-cours-seance-02.html`](05-inf5243-cours-seance-02.html)

# Sommaire des 5 parties

| Partie | Source | Durée | Contenu |
|---|---|---|---|
| 1 | `Nouvel enregistrement.m4a` | 63:23 | Sécurisation des commutateurs, padding & Shadow Ethernet, stacking/LAG, SDN & OpenFlow, supervision SNMP, port mirroring & NIDS, MAC locking, PVLAN |
| 2 | `Nouvel enregistrement 2.m4a` | 21:23 | Normalisation IEEE/IETF, OSI vs TCP/IP, IoT longue portée (LoRa vs Sigfox), SMB & Samba, classes IPv4, gouvernance ICANN/RIR/LIR/ASN |
| 3 | `Nouvel enregistrement 3.m4a` | 36:19 | Anycast et CDN, pénurie IPv4 et vrai rôle d'IPv6, subnetting /30 vs /31 (RFC 3021), NAT44 et saturation de table, CGNAT / NAT444 (RFC 6598) |
| 4 | `Nouvel enregistrement 4.m4a` | 73:51 | Box opérateur & RADIUS, tables de routage statique et ICMP, sockets, handshake TCP, SYN stealth scan, MSS/MTU, architecture DNS |
| 5 | `Nouvel enregistrement 5.m4a` | 79:33 | Enregistrements DNS (A/CNAME/MX/SRV/TXT), `dig`, DoH/DoT, OSINT WHOIS, attaques DNS & DNSSEC, tunneling Iodine, HTTPS/TLS et inspection profonde, CPCE, NAC / Alcasar |


# Partie 1 — Sécurisation des commutateurs, SDN, SNMP, NIDS et PVLAN (≈ 63 min)


**Fichier source :** `Nouvel enregistrement.m4a`  
**Durée :** 1 heure 03 minutes (63:23)  

---

### [00:00 - 05:00] 802.1X, Padding Ethernet, Trame minimale et Shadow Ethernet

**[00:00]** Du 802.1X, vous verrez ensemble, il faut être en forme. En forme, très en forme. Quand on verra ça avec Michael.

**[00:08]** C'est de faire transiter sur Ethernet au début des toutes petites, un tout petit volume de données. Ce qui fait qu'on n'atteint pas la taille minimum qu'une trame Ethernet doit faire.

**[00:21]** Quand la... quand la... quand le driver, il voit arriver ça, il est alerté par l'OS, pareil, par une interruption, comme quoi il doit prendre à une mémoire donnée le contenu et puis fabriquer, envoyer ça de manière électrique. Donc faire du code Manchester, etc., etc. Fabriquer le FCS, fabriquer le préambule. Le reste est fait.

**[00:43]** L'en-tête Ethernet, elle est faite par le... par votre système d'exploitation, par le driver. Tout est fait. La carte réseau, elle récupère ça et elle fait son boulot, c'est-à-dire le FCS à la fin, le préambule au début, et puis elle transforme ça en électricité et paf, c'est parti.

**[00:58]** Eh ben, quand elle reçoit ça, elle s'aperçoit que oup oup oup ! Il manque de la data. Donc elle padde. C'est la norme.

**[01:09]** Et du coup, voilà ce que ça donne. Si je prends une trame là... Regardez, je prends le dernier champ de la trame. Donc c'est de l'Ethernet 802.1X et donc c'est de l'EAP. Bon, c'est transporté... Il n'y a pas d'IP, hein, pas d'IP, de TCP tout ça, que dalle. C'est directement dans Ethernet qu'on met qu'on met le protocole. Protocole de niveau 2.

**[01:32]** Et donc je le remplis. Et vous voyez le dernier champ que j'ai à remplir, il arrive là dans la trame. Il manque... La trame est trop petite. Donc on... Bon, il y a un trou, hein. Le driver rajoute des datas pour arriver à la taille minimum des 64 octets.

**[01:54]** C'est paddé avec des zéros là. Il y a des cartes réseau qui vont padder avec FF. C'est soit FF soit 0.

> 🎯 **[POINT EXAMEN / CANAL CACHÉ] Shadow Ethernet :** Comme la carte réseau destinataire ignore le padding en se basant sur la taille déclarée dans le champ *Length/Type*, un attaquant peut dissimuler des données arbitraires (mots de passe, exfiltration) dans les octets de padding sans altérer la communication.

**[02:02]** Mais en fait, la carte d'en face, elle s'en fout. On pourrait mettre n'importe quoi. D'ailleurs, faire ce qu'on appelle du Shadow Ethernet. On peut cacher de l'information là-dedans. On pourrait planquer une info. Moi, émetteur, je peux planquer une info dans le pad.

**[02:19]** Pourquoi on s'en fout ? Parce qu'à la réception, la carte réseau, elle va voir le frame type. Le frame type, ça lui dit que c'est du 802.1X et donc, la norme étant là, elle sait que ça va s'arrêter là.

**[02:35]** Et donc le reste, c'est du padding. Donc la carte destinataire, elle n'en a rien à secouer du padding. Donc vous pouvez planquer ce que vous voulez là-dedans pour envoyer des infos sur une carte réseau où vous avez votre agent qui va lire ces infos. Comme pour ICMP, je vous rappelle, le ping c'est le moyen de planquer des infos.

**[02:54]** Envoyer un mot de passe à un copain sans passer par les canaux à la con, vous lui envoyez un ping et vous paddez avec votre mot de passe que vous chiffrez si vous êtes vraiment un taré. Mais pourquoi pas ? Et dès qu'il reçoit le ping, dans le padding d'ICMP, il a votre mot de passe et personne ne l'a vu. Personne ne l'a trouvé. Tout le monde s'en fout du ping sur Internet.

**[03:20]** Voilà, ça permet de planquer des infos. Mais voilà, là on a bien un certain nombre d'octets de padding pour que la trame fasse le minimum requis pour que l'algorithme de FCS fonctionne. C'est pour ça qu'on a imposé une taille minimale.

**[03:40]** Bien. Donc taille minimum de 46 octets si je prends en compte que la data, 60 octets si je prends tout le bordel.

**[04:07]** Bon, on a vu la carte réseau. Comment je configure une carte, les problèmes avec les VM, ça hier vous avez bossé là-dessus. On a vu les VLANs, plein de choses sur les VLANs dont les trois techniques de saut de VLAN. On a vu comment fonctionne l'intérieur d'un switch. C'est ce qu'on est en train de terminer, on a vu la moitié du slide. On termine avec ça et bon.

---

### [05:00 - 11:30] Vocabulaire switch, modes de commutation, mémoire CAM et pare-feu L2 (ebtables) vs L3 (Netfilter)

**[04:53]** Dans le vocabulaire, si vous dites switch, si vous parlez de réseau avec quelqu'un, si vous dites switch, il sait de quoi vous parlez. Vous parlez d'un commutateur Ethernet. Mais des switchs en réseau, il y en a plein. Il y a des commutateurs ATM, il y a des commutateurs Frame Relay, donc des protocoles que vous ne verrez jamais parce que vous ne faites pas de spécialité télécom. Il y a des commutateurs téléphoniques, il y a des commutateurs IPBX. Donc switch, c'est un terme un peu générique, d'accord ?

**[05:21]** Faites attention quand le mec en face de vous ne sait pas de quoi vous parlez, si vous n'êtes pas en train de parler d'Ethernet, spécifiez que vous êtes en train de parler d'Ethernet switch, d'un commutateur Ethernet, parce que des commutateurs il y en a plein.

**[05:35]** Donc on a vu que le commutateur, je vous ai montré à quoi ressemblait le préambule. Je vous ai expliqué que c'était un système électronique de pulsation et que, sur une séquence donnée, on va pulser un certain nombre de fois ou pas, ce qui va alerter celui qui est en face des capacités de votre carte réseau. Et lui, il va faire exactement la même chose et on va se mettre sur le plus petit commun diviseur.

**[06:05]** Je vous ai montré ce qu'était une trame Jumbo Frame à 9 kilo, que c'est un paramètre... Il faut que je vous mette une copie d'écran d'une Freebox, de votre carte réseau Linux, où est-ce qu'on modifie ça.

> 💡 **[FONCTIONNEMENT DES SWITCHS] Modes de commutation :**
> - **Store and Forward :** Stockage complet + vérification FCS/CRC (mode historique sûr).
> - **Cut-Through :** Commutation dès la lecture de l'adresse MAC destination (latence min).
> - **Smart Switch :** Cut-Through par défaut, bascule en Store and Forward si le taux d'erreur augmente.

**[06:22]** On a vu que le switch fonctionnait de trois façons. La façon historique, c'est : je stocke la trame, je calcule le FCS, s'il est bon, je commute, s'il n'est pas bon, je jette. Mode de fonctionnement normal. Comme il n'y a plus d'erreur, il n'y a plus à calculer le FCS, donc on passe directement en... Alors ça c'est des noms de technologies marketeuses par rapport aux constructeurs. Dès que l'adresse destination, qui est la première adresse qui arrive dans le commutateur, est vue, on commute. Donc on cherche par où la prendre, on ne calcule pas le FCS.

**[06:58]** La seule chose qui peut l'arrêter, c'est si la trame elle est taguée, il faut attendre que le tag arrive. On rentre l'adresse destination, l'adresse source et le tag, et c'est à ce moment-là qu'on décide de commuter. Quand c'est tagué, le tag est important pour savoir si j'ai l'autorisation ou pas de commuter sur tel port, je ne peux commuter que si le VLAN est identifié.

**[07:22]** On a donc eu naissance dans les années 2000 à ce qu'on appelle des smart switchs qui consistent à travailler par défaut sans calculer le FCS, faire des statistiques et dès qu'on atteint un certain taux d'erreur par trame, rebasculer dans l'autre mode pour éjecter les trames qui sont en erreur. Et puis on continue les statistiques, un peu si possible, et ça c'est lié à quoi ? À un câble réseau pourri.

**[07:55]** À l'intérieur du switch, on a donc une mémoire particulière qu'on n'adresse pas par son adresse mais qu'on adresse par son contenu, d'où son terme : CAM (*Content Addressable Memory*). On peut lui demander, donc en CAM simple, où on demande quelle est la case mémoire qui contient cette donnée (la donnée en question étant une adresse MAC dans notre cas), ou quelles sont les adresses mémoires contenant cette adresse MAC puisque, je vous rappelle, sur un commutateur on peut en effet avoir deux, trois, quatre fois la même adresse MAC sur plusieurs ports. Ce qui en soi, on se dit mais non, c'est pas possible, une adresse MAC elle doit être unique sur le LAN, c'est marqué dans la couche 2 du modèle OSI.

**[08:34]** Oui, sauf que une adresse MAC qui arrive ou qui part sur un autre switch, ce lien d'interconnexion là, eh ben on va voir passer énormément d'adresses MAC sur ce lien-là. Donc on va les enregistrer. C'est pour ça qu'on peut trouver plusieurs fois la même adresse, mais c'est connu puisque c'est des liens d'interconnexion.

**[08:54]** Voilà, rien de particulier, l'adresse MAC n'est pas apprise pendant le préambule. Je vous rappelle, le préambule c'est de l'électronique, il n'y a pas d'adresse MAC qui est diffusée. C'est votre PC qui à un moment donné décide d'envoyer une trame, souvent une requête DHCP, c'est souvent la première chose que vous faites. Et ben là ça y est, c'est le switch qui va apprendre votre adresse MAC à ce moment-là.

**[09:18]** Si vous avez la capacité à tout bloquer, c'est très compliqué hein quand vous branchez une carte réseau, eh ben le switch ne vous connaît pas. Il ne peut pas... Il n'a pas associé votre port, il sait que le port est up, mais il n'a pas associé dans sa CAM une adresse MAC. Donc il ne vous connaît pas, vous n'êtes... Vous êtes un fantôme sur le réseau local. Vous pouvez écouter le réseau avec du Wireshark, il ne vous connaît pas.

> 💼 **[QUESTION ENTRETIEN D'EMBAUCHE ANSSI / PROF] Pare-feu Linux :**
> - Le pare-feu noyau L3 s'appelle **Netfilter** (contrôlé par l'outil CLI `iptables` ou `nftables`).
> - Le pare-feu noyau L2 (filtrage trames/MAC) s'appelle **ebtables**. Répondre « iptables » comme pare-feu est éliminatoire !

**[09:55]** Je peux vous assurer que si je vous mets ce challenge là, ça va vous prendre un bon moment avant de savoir... Sous Windows, vous oubliez bien sûr, mais sous Linux ça va vous prendre un bon moment. Il faudra attendre le cours de Michael la semaine prochaine pour savoir mettre votre pare-feu comme il faut. Et il faudra attendre un cours complémentaire que vous n'avez pas, vous pourrez en parler à Michael si vous voulez, qui permet d'avoir un pare-feu de niveau 2. Parce que Michael va vous apprendre le pare-feu de niveau 3, qui s'appelle Netfilter dans le noyau Linux, IPFilter dans le noyau BSD, iptables étant l'interface pour commander Netfilter. Le pare-feu s'appelle Netfilter.

**[10:30]** Dans un entretien d'embauche à l'ANSSI, je dis : « Mais comment s'appelle le pare-feu Linux ? » Et 9 étudiants sur 10 (ou en tout cas prospects) me disent : « iptables ». Au revoir ! iptables, c'est une ligne de commande en userland qui permet de donner des ordres à Netfilter, qui est le pare-feu Linux. C'est ce que vous verrez la semaine prochaine. Mais ce pare-feu, il est situé à la couche 3 et supérieure. La couche 2 n'est pas vue. Il ne sait pas faire pour la couche 2, il ne sait pas bloquer des trames. Pour ça, il faut prendre une interface d'un autre pare-feu qui s'appelle ebtables et qui permet de faire des règles de pare-feu de niveau 2. Et là vous êtes sûr de pouvoir bloquer vos trames MAC au départ.

---

### [11:30 - 16:35] Stacking vs LAG (LACP), et Software Defined Networking (SDN / OpenFlow)

**[11:28]** Bien, on a vu donc les règles de commutation, rien de très sorcier, tout ça voilà. On a vu quelques mots de vocabulaire, donc ce qu'on appelle le stack. C'est le fait de pouvoir agréger deux commutateurs de même marque, même modèle, même numéro de firmware, ensemble pour ne former plus qu'un. Une seule interface de gestion, un seul SSH, une seule matrice de commutation. Donc c'est propriétaire. Le lien là, que j'ai mis en face avant mais qui est souvent en face arrière, ce lien-là on le commande chez le constructeur parce que c'est des connecteurs propriétaires et c'est de la fibre optique.

**[12:10]** Des grosses marques comme Cisco, Allied Telesis, Alcatel-Lucent ont deux ports comme ça pour pouvoir stacker 2, 4, 8 switchs ensemble. Sans racheter de matériel, j'étends, je n'ai pas à acheter un gros switch. Le LAG consiste à agréger des liens sur le commutateur pour faire des descentes de rocade, ça n'a rien à voir avec ça. Ça c'est pour agréger du matériel électronique, ça c'est pour faire de la communication et augmenter la bande passante. Et si vous n'avez pas de... Vous voyez, il n'y a pas de fibre optique là pour faire une descente de site ou pour remonter à l'étage, mais j'ai la possibilité de prendre des ports Ethernet standards, les agréger pour doubler, quadrupler, octupler. C'est toujours par 2, 4, 8 qu'on fait, 5 ça n'existe pas.

**[13:03]** Les commutateurs Ethernet ont donc une capacité à vous proposer des interfaces d'administration. Heureusement, parce que c'est le boulot des bachelors, c'est exactement le boulot des bachelors. Vous, vous leur dites ce qu'ils ont à faire : « Mets-moi active le DHCP Snooping, mets-moi les VLANs de niveau 3 comme ci comme ci comme ça avec tel plan d'adressage. » Vous donnez la topologie, vous faites de l'architecture, et eux ils ont fait le stage Linksys, Cisco, qui fait qu'ils savent comment faire avec la putain d'interface graphique imbaisable, eh ben ils savent faire. Et c'est eux qui font. Après, vous, vous contrôlez que c'est bien fait.

**[13:52]** Alors, à la fin de cette diapo, je vous parle du SDN (*Software Defined Network*). Vous voyez que là j'ai une interface graphique Alcatel-Lucent qui nécessite une semaine de stage pour apprendre toutes les possibilités d'un switch Alcatel. Pareil pour Linksys, pour Cisco et tout ça. Donc à la fin, ça fait un tas de bêtes de potes qui fait qu'on est compétent sur l'un, pas sur l'autre, c'est un peu embêtant. Est-ce qu'il n'y aurait pas un ou des qui auraient des bonnes idées pour se dire : est-ce qu'on ne pourrait pas se faire une interface commune qui serait valable sur tous les switchs de la planète ?

**[14:34]** Bon, c'est un vœu pieux parce que eux ils n'aiment pas eux, enfin bref, ils ne s'aiment pas, c'est des concurrents directs. Et ben heureusement, le système open source a un peu brusqué les commerciaux et les industriels pour leur dire : il y en a marre. Il y en a marre d'avoir des interfaces différentes et surtout il y en a marre d'avoir des API différentes derrière. Parce que on a le SSH aussi qui fonctionne, donc des commandes CLI pour piloter le switch, pour le configurer. Eh ben vous voulez faire une certification Cisco, vous apprendrez le CLI Cisco. Et puis quand vous irez chez Alcatel-Lucent, il faut tout recommencer. Parce que ça ressemble, mais il y a assez de différences pour que ça énerve. Avec l'option -n chez Cisco qui fait ceci cela, et l'option -n de la même commande sous Allied Telesis ou chez Alcatel qui fait complètement autre chose. De quoi péter les plombs !

> 💡 **[ARCHITECTURE SDN & OPENFLOW]**
> - **Data Plane (Plan de données) :** Matrice ASIC ultra-rapide matérielle.
> - **Control Plane (Plan de contrôle) :** Déporté sur un contrôleur centralisé.
> - **API Sud (Southbound) :** OpenFlow (normalisé par l'Open Networking Foundation - ONF).
> - **API Nord (Northbound) :** Interface REST pour automatisation/cloud.

**[15:30]** Est-ce qu'il n'y aurait pas moyen d'unifier tout ça ? Cette unification a lieu en ce moment. Aux dépens des industriels qui n'en voulaient pas du tout. Ça s'appelle le Software Defined Network. Cette uniformisation, elle est imposée par les data centers, par le cloud, par tout ça où il faut pouvoir piloter des switchs en live avec des interfaces de gestion communes où on va piloter 10 switchs en même temps. Qu'il y ait du Cisco ou de l'Alcatel, il faut que les 10 switchs fassent la même chose. Vous imaginez bien qu'il va falloir qu'on présente une API identique pour pouvoir pivoter tous ces switchs. Ça s'appelle le Software Defined Network. Vous voyez une diapo là-dessus.

**[16:11]** Et c'est le libre qui a tout amené, il n'y a aucune solution propriétaire là sur cette technologie. Donc on va trouver une API commune de pilotage des commutateurs, imposée par l'industrie du cloud, proposée par l'open source, ça s'appelle le SDN. Pour pouvoir piloter tout par automate.

---

### [16:35 - 27:43] Supervision réseau avec SNMP (Polling vs Traps, MIBs et Détection de Rogue APs)

**[16:35]** Bien, donc on poursuit, on s'était arrêté là hier. Les commutateurs Ethernet ont des capacités de monitoring pour savoir où est-ce qu'il en est, puis pourquoi pas lui donner des instructions particulières. Alors on pourra tout faire avec ce protocole qui s'appelle SNMP (*Simple Network Management Protocol*). Très intéressant ce protocole, surtout dans le cadre de la cybersurveillance. On va pouvoir récupérer des informations par le biais de ce protocole. Comment ça fonctionne ?

**[17:05]** Donc le protocole s'appelle SNMP. Il fonctionne sur UDP, c'est un protocole de réseau parmi tant d'autres qui permet de manager des équipements. Deux possibilités : surveiller l'équipement, d'où les outils de surveillance graphique qui récupèrent les infos et qui vous en font des beaux graphes. Il y en a watt mille des outils de surveillance, les plus connus étant Cacti, Nagios. Vous avez peut-être entendu parler de ces noms-là. C'est ce que les TSI mettent en place sur leur tableau de bord. Et le matin ils arrivent, ils regardent, ils voient que le switch numéro 3 il est en overload, ils vont regarder dessus : qu'est-ce qui se passe ? Pourquoi il est en overload ? Pourquoi il est parti en sucette ? Pourquoi il est arrêté ? Voilà, ça permet de monitorer les équipements réseau.

**[17:54]** Les points d'accès Wi-Fi sont compatibles SNMP, les commutateurs sont compatibles SNMP, les pare-feux sont compatibles SNMP. Tous les équipements réseau aujourd'hui pro ont des agents SNMP pour pouvoir récupérer des ordres et pour pouvoir envoyer des métriques pour faire des beaux tableaux de bord pour que le DSI le matin, en un clin d'œil, se dise : « Hop, ça ça marche pas, pourquoi à Lyon ça merde ? » Les passerelles VPN ont du SNMP, tout le monde. Donc tous les équipements réseau peuvent être monitorés comme ça. Voilà des outils, les plus connus ce sont ceux-là : Centreon et d'autres outils, tout ça c'est libre. Et ça vous fait franchement des graphiques de haut niveau.

**[18:46]** Quand vous voulez envoyer un ordre, vous envoyez un ordre et puis c'est bon. Quand vous voulez récupérer du monitoring, voilà comment ça fonctionne. Vous allez voir parce qu'en cyber on va l'utiliser. Vous refaites une requête SNMP et vous demandez : « Donne-moi l'état de ta mémoire, donne-moi l'état de ta charge (load), donne-moi qui tu es, quelle version de firmware. » Voilà ce qu'on peut faire avec SNMP.

**[19:12]** Il y a tout un tas de commandes qui sont normalisées que tous les équipements réseau doivent répondre. On appelle ça les commandes publiques. C'est un lot de commandes : version, nom, état de la mémoire, état du processeur, des trucs basiques. Ce sont des commandes publiques. Et puis ensuite, il y a les commandes privées, c'est-à-dire elles ne concernent que ce modèle de switch de tel équipementier, et ben il faut connaître la commande. Il n'y a que lui qui l'a implémentée comme ça. Il y aura une réponse, mais si vous ne la connaissez pas, vous ne pouvez pas la questionner. Et donc ce lot de commandes SNMP propriétaire, ça s'achète. C'est commercial.

**[20:00]** Toutes les commandes publiques, elles y sont. Si l'équipement ne répond pas, il n'est pas compatible SNMP. Il y a grosso modo 200 à 300 informations qu'on peut récupérer, basiques mais qui sont très intéressantes. Toutes les autres informations sont liées à des commandes propriétaires que vous devez acheter. Si vous ne les avez pas achetées et donc mis une licence dans le switch, le switch ne répondra jamais aux sollicitations même si vous connaissez la commande. Vous les achetez aussi pour les mettre dans l'outil qui va les lancer. Et ça coûte une blinde.

**[20:41]** Le produit commercial qui fait référence sur la planète, qui est utilisé par toutes les grosses institutions d'administration réseau, s'appelle HP OpenView de la société HP. La licence, le ticket d'entrée, c'est 15 000 balles. Et en fait, dans les 15 000 balles, il y a 3 000 balles de HP OpenView le logiciel, et tout le reste ce sont les jeux de commandes propriétaires pour Alcatel, pour Cisco, pour machin, pour bidule que vous achetez avec le produit. Et quand vous avez ce produit, c'est la Rolls. Ce produit, ça vous permet d'avoir des visus de votre baie de brassage avec le switch qui a exactement la même forme, couleur que le vrai. Et vous voyez les trucs bagoter, les LED bagoter en temps réel. C'est quand même des outils de fou ! Et vous allez sur le port, le port graphique, vous voyez sur le switch, vous allez dans votre baie, la baie numéro 3, vous prenez le switch numéro 2, vous allez sur le port, vous cliquez droit et vous dites : « Toi maintenant VLAN 3. » Et pouf, ça va mettre le port dans le VLAN 3. C'est pour ça qu'on paye. HP OpenView.

**[21:55]** Ces blocs de commandes là SNMP, ça s'appelle des MIB en terme de vocabulaire. La MIB HP, la MIB Cisco, ce sont ces jeux de commandes propriétaires qu'on doit intégrer, qu'on doit libérer par licence. On met la licence dedans et crac, ça libère le jeu de commandes. Et il faut l'outil qui sache les requêter, donc il faut acheter ce jeu de commandes aussi. Ce sont juste des lignes, c'est long une ligne de commande SNMP, ça peut faire jusqu'à 1000 caractères, c'est très très long. La réponse peut être longue aussi. OK pour le requêtage ? C'est de l'UDP, c'est très simple.

> 🎯 **[POINT EXAMEN] SNMP Polling vs Traps :**
> - **Polling (Get/Set sur UDP 161) :** Le serveur de supervision interroge l'agent à intervalles réguliers.
> - **Traps (Alerte sur UDP 162) :** L'équipement pousse spontanément et immédiatement un message critique vers le serveur lors d'un événement anormal (ex: détection d'un Fake AP Wi-Fi, port coupé).

**[22:35]** Une trap SNMP, là ça va nous intéresser nous en cyber. C'est en fait... Regardez, la flèche elle est en simplex. C'est que dès qu'il y a un événement particulier sur l'équipement, je peux le configurer pour qu'il m'alerte. Il m'alerte de l'événement. Exemple : sur ce point d'accès Wi-Fi, j'active le radar des canaux Wi-Fi. On appelle ça le radar SSID. Très peu de points d'accès Wi-Fi l'ont. C'est un scanner interne qui tourne et qui a appris où sont les points d'accès Wi-Fi qui balancent le même SSID que lui. Lui, il balance trois SSID : ESIA, Groupe ESIA, Invité ESIA, d'accord ?

**[23:28]** Il les balance sur trois canaux différents : le 7, le 14 et puis le 1 par exemple. Il fait ça. Et puis s'il a une option à côté, il scanne tout l'environnement Wi-Fi et il regarde les autres points d'accès autour comment ils envoient ESIA, Groupe ESIA, Invité ESIA. Donc il s'aperçoit qu'il y a un point d'accès, c'est calé géographiquement, mais qui envoie et que lui le reçoit à -70 dB. Vous avez fait de la radio l'année dernière. OK, et puis il y a un autre qui envoie... Donc il ne sait pas les localiser, mais il sait à cet endroit-là qu'est-ce qu'il capte des autres points d'accès Wi-Fi pour ces trois SSID là. Ça vous va ça ?

**[24:09]** Ça on lui fait apprendre. Quand est-ce qu'on le fait ? On le fait tous les étés, quand vous n'êtes pas là. Il n'y a personne à l'école. On revoit tout notre système de Wi-Fi et on dit à nos points d'accès : « OK, là c'est l'état nominal. Vous apprenez cet état-là. » Donc ils apprennent l'environnement Wi-Fi qui est autour d'eux. Et vous vous êtes pas là pour foutre le bordel. Dès qu'ils ont appris, il leur faut 1 minute 30 pour faire des scans et regarder les autres points d'accès Wi-Fi à combien ils émettent. Ils figent.

**[24:48]** Et vous arrivez. Et on leur a demandé : dès que vous voyez un SSID de ces trois-là complémentaire ou supplémentaire que vous n'aviez jamais vu avant, vous nous envoyez un trap SNMP. C'est-à-dire que vous nous envoyez... ces équipements vont nous envoyer une information SNMP en disant : « Moi, je viens de voir un point d'accès Wi-Fi nouveau que je ne connaissais pas qui envoie ESIA en SSID. » Ça s'appelle un Fake AP. C'est un étudiant qui est en train de jouer.

**[25:21]** Et donc comme on reçoit ce trap là de plusieurs points d'accès Wi-Fi (celui-là, celui de la 215 et là), lui il va me dire « Je le reçois à -40 dB », lui il va me dire « Je le reçois à -60 », et celui qui est au fond du couloir à -70. Qu'est-ce que je fais ? Je viens dans la salle 211, je dis : « Qui c'est qui a créé un point d'accès Wi-Fi ? » Ça vous va ?

**[25:47]** Un trap SNMP, donc c'est une action, c'est une remontée d'information sans questionnement. C'est directement l'équipement qui pousse l'information auprès de l'outil de monitoring, et qui permet de monter des alertes. Je viens de vous donner un exemple d'alerte pour un point d'accès Wi-Fi, on verra quand on va avancer en sécurité tout ce qu'on peut mettre comme alerte sur un commutateur. On peut faire plein de choses.

**[26:15]** Maintenant, c'est comme tout : s'il n'y a personne qui regarde ce truc-là, ça sert à rien. Donc à vous après de faire un outil là-dedans qui envoie un mail automatique ou un SMS à l'administrateur en disant... Ça dépend du niveau de sécurité de l'organisme. Si vous êtes dans une centrale nucléaire, eh ben oui, dès que vous voyez un Fake AP, il y a quelqu'un qui reçoit un SMS. C'est pas normal du tout ! Si vous êtes dans une boîte qui en a rien à battre, eh ben ils n'en ont rien à battre. Il n'y a même pas de trap.

**[26:45]** Mais on peut faire énormément de choses en sécu sans acheter de matos sécu là, vous voyez ? C'est ça que je veux dire. Sans rien acheter, c'est by design, vous avez plein de possibilités sur les équipements réseau. Et c'est bien les équipements réseau de toute façon qui permettent aux pirates d'accéder. Donc c'est plutôt intéressant de les faire bosser eux, parce que c'est eux qui vont voir l'entrée en premier. Je viens de vous donner un exemple avec les radars Wi-Fi, on va voir plein d'autres exemples avec les switchs, les routeurs. Et on n'achète rien. Ça coûte zéro ! Zéro ! Si, de faire un abonnement SMS. Est-ce que c'est compris SNMP ? Vous aurez des questions sur SNMP.

---

### [27:43 - 33:04] Sécurisation du switch : Port Mirroring (SPAN) et NIDS (Suricata)

**[27:43]** Alors, on va parler de sécurité sur le commutateur du coup maintenant. Puisque vous savez comment un commutateur va pouvoir nous remonter des infos : quelles infos je pourrais lui demander en sécurité ? Ah, la question !

> 🎯 **[POINT EXAMEN] Port Mirroring & NIDS :**
> - Duplique le trafic d'un port surveillé vers une sonde d'intrusion (**Suricata**).
> - **Contrainte :** Consomme 1 matrice de commutation interne (diminue de 50% la capacité de commutation si 2 matrices).
> - **Sécurité de la sonde :** Doit être en écoute passive pure (aucune IP, aucune émission) pour rester invisible aux attaquants.

**[27:56]** Alors en sécurité, un des premiers paramètres qu'on peut mettre en place dans un commutateur, c'est très intéressant, c'est ce qu'on appelle le Port Mirroring. C'est la capacité d'un commutateur à recopier le contenu d'un port sur un autre. À quoi ça peut servir ? J'ai marqué : à mettre des systèmes d'analyse dessus. Et comme on analyse des trames réseau, eh ben ce système d'analyse s'appelle un NIDS (*Network Intrusion Detection System*). Ça fait partie de la famille des IDS (détecteurs d'intrusion), mais celui-là est typé pour faire de la détection d'intrusion à partir d'événements reçus en réseau, à partir de trames, de paquets.

**[28:42]** Et donc là-dedans on va trouver une base de connaissances de scénarios : qu'est-ce que c'est qu'un scan de ports ? Qu'est-ce que c'est qu'une attaque par injection SQL ? Qu'est-ce que c'est... On l'alimente avec une base de connaissances de scénarios réseau connus et dès qu'il va voir passer... Ce qui est intéressant à faire quand on est un spécialiste cyber, c'est de pirater l'accès à Internet. Vous prenez tout l'accès Internet de l'entreprise. Ça peut être du gigabit. C'est pour ça que je commence à vous dire que Wireshark il va peut-être tousser si vous commencez à mettre Wireshark là-dessus. Parce qu'à un gigabit, ça se trouve sa carte réseau elle n'est même pas compatible. Donc imaginez que là ce détecteur d'intrusion, non seulement il doit capturer 1 gigabit, mais il doit analyser 1 gigabit. Donc c'est pas un PC portable qu'on met là, c'est un truc qui déboîte ! Pas le choix.

**[29:39]** Aucune interaction n'a lieu entre ce poste et ce port. C'est-à-dire que là on a du mirroring, c'est-à-dire qu'on va avoir l'émission et la réception de ce port-là qui va partir ici, mais ce port-là ne peut pas interagir avec cette machine. Pourquoi ? Parce qu'un détecteur d'intrusion, si on est capable de le détecter, c'est mort. Donc quand le pirate il va faire ses... On verra ça un peu plus tard, il va faire des techniques pour savoir s'il y a un détecteur d'intrusion, ça serait bien que lui ne puisse pas répondre. Donc ce port-là, il est isolé. On a dessus tout le trafic qui est mirroré, mais si lui fait un ping, ça n'ira jamais plus loin que là. Et heureusement, sinon il est détectable. Il ne faut pas qu'il soit détectable. Ça vous va ?

**[30:29]** Donc ça on va... Donc ça c'est des cours que je vous donne un peu plus tard, des cours sur la détection d'intrusion. On verra ça, ça fait partie du cybermonitoring. On va mettre un outil là-dedans qui s'appelle... Un petit nom là à me donner ? Un détecteur d'intrusion très très très très connu, open source bien sûr ? Suricata ! Suricata, par exemple. Et on va l'alimenter toutes les 24 heures avec sa nouvelle base de connaissances parce que là, hier soir on a deux nouveaux types d'attaques qui ont été détectés sur les réseaux, qui ont été caractérisés, formalisés, et on fait rentrer ça dans Suricata. Ce qui fait que l'attaque d'hier soir, ça y est maintenant il est capable de la reconnaître. Une attaque sur une base de données, une attaque sur un ERP, une attaque sur un je-ne-sais-pas-quoi, ben il est capable de la reconnaître parce que il a le pcap qui correspond à cette attaque. Ça vous va ?

**[31:28]** Voilà. Donc très intéressant. Problématique : très coûteux. Si le switch est capable de faire ça, il est obligé de libérer une matrice de commutation pour faire ça. Pourquoi ? Parce que comprenez bien qu'à l'intérieur d'une des matrices, il va faire un lien entre tout ce qui va... toute la matrice qui va commuter là-dessus et il va faire ce lien-là lui de manière permanente. Donc il enlève une matrice. Si vous avez acheté un switch qui vaut 10 000 balles qui a deux matrices de commutation, vous faites un port mirroring, vous n'avez plus qu'une matrice. C'est coûteux ! Parce que c'est ce qui coûte le plus cher dans un switch, c'est les matrices de commutation. Si votre switch n'a qu'une matrice de commutation, il n'y a pas l'option port mirroring.

**[32:21]** Vous avez des petits switchs à 8 balles, vous ne pouvez pas faire de mirroring de port parce que sinon comme il n'y a qu'une seule matrice, après on ne commute plus. OK ? C'est coûteux. Donc les DSI qui disent : « Ouais, on va faire du port mirroring », dites-leur : « Vous savez de quoi vous parlez là ? » « Ben comment ça ? On coche OK. » « Ah oui, mais vous allez peut-être diviser par deux votre puissance de commutation dans votre réseau local. Ça va se sentir ! » Si vous avez 4 matrices de commutation parce qu'il y a un beau switch qui coûte cher, OK, on en enlève une, peut-être pas trop grave. Mais quand il y en a que deux... Quand il y en a qu'une, de toute façon il n'y a pas l'option. C'est bon ?

---

### [33:04 - 45:10] Menace interne, désactivation des ports, MAC Locking (Port Security) et DLP

**[33:04]** En cybersécurité, il y a une des menaces les plus compliquées à gérer, c'est la menace interne. C'est le mec qui est dedans, qui est rentré à l'intérieur physiquement du réseau, va se plugger sur une prise. Moi, dans une salle d'attente chez le dentiste, vous quand vous êtes en train de poireauter, vous voyez des prises RJ45 qui traînent, on a juste envie de plugger un truc dedans quoi.

**[33:43]** Donc une des premières solutions pour éviter ces conneries, c'est que les ports qui ne sont pas utilisés... Parce que je vous rappelle que l'électricien, quand il va venir faire le réseau, il va câbler toutes les prises. C'est son boulot. Toutes les prises qui sont dans les salles, il les câble avec le câble de desserte, vous vous rappelez, le câble qui fait 90 m là. Il va dans les baies et il câble tout et il met tous les cordons de brassage. C'est ces cordons qui vont de l'armoire de répartition au switch. Il est obligé de tout mettre parce que sa recette, c'est-à-dire que son boulot est fini quand on sait qu'en branchant un câble de liaison là, ça marche, on est commuté. Donc il est obligé de tout faire. Et il fait tout. Donc tous les bâtiments, tous les immeubles de la Défense, tout ça, c'est câblé.

**[34:35]** Après, c'est à la DSI, à partir de cet état complet fonctionnel, de choisir ce qu'elle veut faire. Ben le premier truc à faire, ça s'appelle une cartographie physique du réseau et de se dire : mais dans cette salle d'attente, est-ce bien raisonnable de laisser les prises branchées ? C'est tout con, ça coûte zéro ! Il faut faire cette cartographie, ce qu'on appelle la cartographie physique, et puis ben dire : ben non, les 4 prises réseau de cette salle qui devient une salle d'attente, je les désactive. C'est-à-dire que dans le commutateur, je vais dire : ces 4 là là, allez hop, même si elles sont branchées, il se passera jamais rien, elles sont disabled dans la conf du switch. OK ?

**[35:18]** Et voilà ! Ce qui fait que le pirate, il peut toujours essayer de se brancher où il veut, il faudra qu'il prenne la place d'une machine existante. Et ça, tous les switchs vous ont cette possibilité de d'inhiber les ports inutilisés. Il y a une autre solution simple, c'est que le cordon de brassage qui vient dans le switch ici, vous l'enlevez. Et ça, vous n'avez pas toujours la possibilité. Si vous êtes locataire dans votre entreprise de deux étages d'un immeuble, c'est pas vous qui gérez les câbles. C'est une entreprise de service que vous payez tous les mois et les armoires sont fermées à clé, vous n'avez pas la clé même si vous êtes propriétaire du switch qui est à l'intérieur.

**[36:01]** Donc débrasser, c'est-à-dire enlever le cordon de brassage entre le module de répartition et le switch, le truc qui fait quelques centimètres là, c'est très élégant hein, clac et puis ça y est on a plus de problème de pirate qui vient dans les prises à la con. Mais peut-être vous n'avez pas cette possibilité-là parce que c'est pas à vous la baie. La baie, elle appartient à l'entreprise qui gère tout l'immeuble. Or, comme c'est votre switch, vous pouvez le manager. Et via SSH, via l'interface de gestion qu'on a vu tout à l'heure ou via une interface logicielle de Software Defined Network, vous pouvez dire : les ports 1, 8, 14, 17, 18, 21 disabled, parce que ça va dans des endroits chez moi où je ne veux pas que quelqu'un se connecte. Ça vous va ?

> 🎯 **[POINT EXAMEN] MAC Locking (Port Security) & Contournement attaquant :**
> - **Principe :** Verrouillage de l'adresse MAC autorisée sur un port donné dans la mémoire CAM. Si une MAC inconnue se branche $\rightarrow$ mise en `err-disable` et Trap SNMP.
> - **Contournement par le pirate :** Doit espionner passivement le trafic du poste légitime (Hub / Tap physique / Wireshark) pour usurper sa MAC (`ip link set dev eth0 address XX:XX...`).

**[36:58]** Autre solution : ce qu'on appelle le MAC Locking. Lisez, est-ce que quelqu'un n'a pas compris ce qui est marqué au tableau ? C'est bon pour tout le monde ? Pas besoin de faire de commentaires ? L'intérêt c'est ça : c'est que vous dites au switch d'apprendre l'adresse MAC qui est ici là de ce poste. Donc dans sa mémoire CAM, vous avez vu comment ça marche une mémoire CAM, il n'y a que sur ce port-là il y a l'adresse MAC de ce PC là. Si un pirate vient avec son PC, se plugge là-dedans, il a du réseau, sauf que au même moment l'administrateur sait que quelqu'un a... une adresse MAC qui n'est pas celle de ce poste est venue sur ce port.

**[38:05]** Donc on met ça sur les salles serveurs, sur les salles où il y a les data centers. On verrouille les adresses MAC et quelqu'un qui vient, hop il est détecté, alerté. Qu'est-ce qu'il doit faire le pirate s'il veut être bon là ? Ah oui ! OK pour tout le monde ? Vous devez donc... Si vous arrivez dans un organisme et que vous voulez prendre... et vous pouvez pas, vous venez sur une prise, hop elle marche pas, il y a rien. Alors il y a rien soit parce que disabled, soit parce que débrassé, d'accord, soit parce que 802.1X qu'on verra plus tard. Il y a rien, on peut pas. Il dit : « Bon, j'ai rien. »

**[38:52]** Donc il cherche et puis il dit : « OK, ils ont bien fait leur boulot, il n'y a que là où il y a les postes que les ports sont activés. » Mais il dit : « Hmm, ça se trouve ils ont mis du MAC Locking. » Donc le poste, il est dans une salle là, il y a les postes qui sont branchés, il dit : « Qu'est-ce que je fais ? Il faut que je chope l'adresse MAC du poste pour pouvoir l'usurper et la prendre pour moi. » Vous êtes d'accord ? Sinon il va se faire gaufrer le mec. Donc et ben il est obligé d'attendre que le poste soit présent déjà, voilà. Comment il va faire ? Il faut qu'il mette un hub. Il va falloir qu'il mette un capteur, il attend que le poste se présente. Il a mis un hub donc le poste se présente pas, il ne va pas mettre sa prise là mais dans un hub, donc il faut planquer un hub.

**[39:36]** Il va mettre du Wireshark pour voir quelle est l'adresse MAC du poste, vous n'avez pas le choix. Dites-moi si vous avez une autre solution, sinon il faut voler le poste. Comment vous pouvez connaître l'adresse MAC d'un poste qui n'est pas là ? C'est compliqué ! Vous voyez c'est chiant. Quand on fait ça, on complique la vie du pirate. Il va devoir faire une manip complémentaire, récupérer la vraie adresse MAC, la prendre : `ip link set dev eth0 address MAC` égale l'adresse MAC que vous voulez. Et là, vous pouvez rentrer sans vous faire voir. Vous voyez comment c'est chiant quoi, hein ?

**[40:09]** Et c'est bien le but ! Comme c'est chiant, il va prendre du temps, il va devoir revenir, installer, il va peut-être se faire gaufrer. C'est ça le principe de la sécurité, c'est de mettre des barrières qui fait qu'à un moment donné on dit : « Stop. »

**[40:26]** Non mais là il est physiquement dans le... On est sur la menace interne. Le détecteur d'intrusion, c'est par rapport au flux qu'il y a sur Internet. C'est autre chose. C'est des possibilités différentes de sécu ça. Le port mirroring c'est une possibilité, c'est pour analyser tout ce qui rentre et qui sort du réseau. Vous verrez dans le lab de cybersurveillance, ça je vous le fais faire hein, avec Marionnette.

**[40:53]** Et là, qu'est-ce que vous faites ? Vous faites des scénarios. Par hasard, vous avez choisi Suricata. Et dans le scénario, je vais vous mettre un scénario tangible, réaliste. Grosso modo, je vais vous dire : « OK, je suis le DSI, on fait du port mirroring, ouais parce que Marionnette mine de rien sait le faire. Eh ben vous allez le faire et puis je vais vous dire : dès que dans le détecteur d'intrusion sur un flux POP (donc de récupération de courrier électronique) vous trouvez tel nom "sixweights" je sais pas quoi, vous levez une alerte. »

**[41:28]** Ça veut dire que le DSI veut savoir : est-ce que quelqu'un parle d'un sujet secret à l'extérieur ou d'un projet secret qui porte tel nom ? Eh ben vous, vous vous mettez en analyse de tout parce que vous avez tout. Vous pouvez même déchiffrer. Pourquoi vous pouvez déchiffrer ? Parce que vous êtes dans une entreprise où on a mis la PKI dans tous les navigateurs. On a mis le certificat racine de l'entreprise ou de l'État si on est dans un ministère dans tous les navigateurs des collaborateurs. Ce qui fait que tout le flux HTTPS ici, vous l'avez en clair ici. Tout le flux SMTPS de messagerie, de je sais pas quoi, vous l'avez tout en clair. Quand un mec de l'entreprise envoie un message et que dedans vous trouvez un pattern que vous cherchez, ça sonne ! Et vous évitez ce qu'on appelle la fuite d'information (*Data Loss Prevention* - DLP).

**[42:18]** C'est une des menaces qu'on a le plus aujourd'hui dans les grandes entreprises : le collaborateur indélicat. Eh ben lui, il prend un coup de pied au fesses et il pointe au chômage le lendemain. Donc faites attention à ce que vous faites dans vos entreprises maintenant hein ! Parce qu'un détecteur d'intrusion veille et veille sur vos flux chiffrés.

**[43:09]** Ah oui, c'est pas faux ! S'il y a une hypothèse sur un switch qui a déjà eu des ports ouverts, ils ont quand même commencé à bosser en sécu. Si les ports sont open, c'est open, ça veut dire qu'il n'y a rien. Mais à partir du moment où vous vous apercevez qu'en branchant vous n'avez rien, vous dites : « Ah ! Ils ont déjà fait cet état-là. » Donc c'est pas impossible qu'ils aient fait aussi celle-là. C'est assez lié quand même. Et donc là vous dites : un pirate il ne part pas du scénario du plus pourri mais en face il a un ordre. Donc il va se mettre dans sa tête, il va essayer de prendre toutes les précautions possibles et c'est petit à petit qu'il va voir : « Ah non ça ils n'ont pas dû le mettre en place. Ah non ça non plus. » Mais il faut partir du préalable où ils sont bons. Et donc vous montez des scénarios où ils sont bons. S'ils sont moins bons, tant mieux pour vous. OK ?

---

### [45:10 - 53:41] Private VLAN (PVLAN) : Ports Isolés, Communautaires et Promiscuous

> 🎯 **[POINT EXAMEN] Private VLAN (PVLAN / Client Isolation L2) :**
> - **Port Isolé (*Isolated*) :** Ne communique avec aucun autre port (ni communautaire, ni isolé), communique UNIQUEMENT avec le port promiscuous. Bloque les attaques latérales.
> - **Port Communautaire (*Community*) :** Communique avec les membres de sa communauté et le port promiscuous.
> - **Port Promiscuous :** Connecté à la passerelle/serveurs et accessible par tous les ports.

**[45:10]** Donc port mirroring, enable/disable, MAC Locking, on continue. Sur les commutateurs de dernière génération, grosso modo ceux qui ont moins de 5 ans, on a des notions de VLAN qui ont été un peu marketées. Ça reste des VLANs, mais on a marketé un petit peu certains types de VLANs pour leur donner une espèce de typologie. La technique là que je vais vous montrer, elle est héritée des points d'accès Wi-Fi. Une technique de protection des points d'accès Wi-Fi.

**[45:43]** La technique consiste à faire la chose suivante pour les points d'accès Wi-Fi : vous êtes d'accord avec moi, là-haut vous avez un manager, un manager de temps. Vous êtes tous connectés à lui sur la même fréquence et ce manager de temps va vous donner des slots chacun pour discuter. Vous êtes d'accord ? Mais entre vous, via ce manager, est-ce que vous pouvez discuter entre vous ? Est-ce que vous êtes sur le même réseau local quand vous êtes tous connectés à ce point d'accès Wi-Fi ?

**[46:15]** La réponse est oui. Vous êtes tous sur le même réseau local Wi-Fi, au même titre que vous êtes tous sur un même réseau local Ethernet. Et donc vous pinguez votre voisin, ça ne pose aucun problème. Est-ce que... Alors il faut avoir le même plan d'adressage, patati patata, faut pas avoir de pare-feu. OK. C'est comme si vous étiez avec un commutateur sauf que vous mettez un point d'accès Wi-Fi. La différence c'est que vous passez par un tiers. Et c'est ce tiers qui redirige les flux vers les uns vers les autres. En Ethernet, c'est commuté, le commutateur il fait que commuter, il est con comme la lune. Alors que là, il vous donne des ordres, il vous dit : « Toi maintenant, toi plus tard », voilà. Vous êtes d'accord ?

**[46:54]** En Wi-Fi, on a ajouté une fonctionnalité dans ces points d'accès pour interdire que les utilisateurs d'un point d'accès Wi-Fi communiquent entre eux. Donc le point d'accès Wi-Fi prend vos données pour les envoyer sur le réseau et sur Internet, autrement, mais interdit que les clients entre eux... En fait, il ne fait pas ce qu'on appelle du hub and spoke, je prends et je renvoie à un autre utilisateur. C'est son fonctionnement normal ça. Si vous faites rien, ça fonctionne, vous vous pinguez entre vous ça marche. Sauf si j'active ce qu'on appelle le Client Isolation. Je pense que le terme se suffit à lui-même. J'isole les clients, c'est-à-dire je fais en sorte que vous ne pouvez plus communiquer ensemble avec le point d'accès... enfin entre vous via le point d'accès Wi-Fi.

**[47:43]** Vous communiquez avec le point d'accès Wi-Fi qui vous met la connexion Ethernet derrière et Internet, mais vous pouvez plus vous pinguer et vérifier, vous pouvez plus vous pinguer. À l'école, vous pouvez pas vous pinguer. Sauf s'il y a un point d'accès Wi-Fi où on a oublié le Client Isolation. Vous comprenez le principe ? Pour lui c'est très simple, il connaît tous ses clients, il sait qu'il n'a pas à rediriger les trames et les paquets pour ses clients. Il les redirige que vers la sortie Ethernet puisque c'est un routeur, c'est une passerelle. Ça vous va ça ?

**[48:12]** Cette capacité là de Client Isolation dans les points d'accès Wi-Fi, on ne l'a pas dans les switchs. C'est dommage ! Parce que c'est très intéressant que les usagers ne puissent pas communiquer entre eux en terme de sécu. Pourquoi ils communiqueraient entre eux dans une entreprise ? Pourquoi ? Ils ont des serveurs : un serveur AD, des serveurs de fichiers, des serveurs vidéo, des serveurs... Ils n'ont pas à communiquer entre eux. S'ils communiquent entre eux, c'est un truc bizarre quand même. Déjà, ça veut dire qu'ils maîtrisent le réseau, communiquer entre eux ça veut dire qu'il y en a un qui a un serveur, il y a un client, il a monté un petit site web ou je ne sais pas quoi. Qu'est-ce que c'est que cette merde ? Un client c'est un usager du réseau, il n'a pas à faire ce qu'il veut sur le réseau. Donc ça serait super sympa d'avoir ce Client Isolation qui a été inventé pour le Wi-Fi dans un commutateur.

**[48:58]** Voilà ce qui est arrivé dans les commutateurs il y a 5 ans, c'est très récent. Et donc on appelle... Donc ce sont des VLANs tout ça, mais qui sont designés un petit peu à la construction si vous voulez. Et alors est-ce que ça, ce schéma, est-ce que vous arrivez à le comprendre par rapport aux trois VLANs ? C'est bien ça qu'il y a dans le commutateur, ils sont by design. Enfin vous pouvez les défixer et c'est vous qui affectez un port. C'est vous qui dites : « OK, ce port-là ça sera un port isolé, celui-là ça sera un port promiscuous, celui-là ça sera un port... » Enfin il faut quand même lui dire, le commutateur ne peut pas le deviner. Est-ce que ça vous va ?

**[49:40]** Donc grosso modo : un port communautaire, c'est un VLAN. VLAN 3, port communautaire numéro 3. VLAN 12, port communautaire numéro 12. Ils ont mis un nom marketeux sur VLAN. On appelle ça un port communautaire. C'est un VLAN avec... voilà. Les gens qui sont sur un port communautaire 2, ils sont tous dans le VLAN 2. OK ? Ça c'est simple.

**[50:09]** Maintenant, on a deux autres types de ports : on a un port promiscuous. Donc le port promiscuous, regardez, c'est un port où tout peut arriver, où tout peut partir. Donc quand vous mettez un port promiscuous dans un associé à des ports communautaires, eh ben ça va être le port de sortie pour aller sur Internet généralement. Donc c'est un port qui va être dans plusieurs VLANs, c'est ça que ça veut dire. C'est un port qui va être dans le VLAN 2 plus le 3 plus le 4 et qui permet à tous ces VLANs d'aller sur Internet avec une seule box. Ça va ? Port promiscuous, donc c'est un port qu'on va pouvoir plugger dans plusieurs VLANs en même temps et il est capable de faire ce que vous voulez : aller sur un serveur AD, aller sur le routeur de sortie et puis c'est bon.

**[51:00]** Et c'est là qu'on... Et ça, on n'a rien inventé là. Ça c'est un port qu'on met dans plusieurs VLANs, ça c'est des ports qui sont dans leur VLAN. Là, ça c'est la vie de tous les commutateurs, sauf qu'ils ont mis un nom commercial sur VLAN. OK ? Ça, c'est ce que vous savez déjà faire : mettre un port dans plusieurs VLANs et puis mettre un port dans un seul VLAN. C'est la définition d'un commutateur normal.

**[51:24]** Ce qu'on invente, c'est ça qui vient du Wi-Fi : où on va faire un port isolé, c'est-à-dire que il ne peut pas communiquer sur les autres ports. Un port isolé, aucune possibilité de communiquer vers les ports communautaires, voire vers un autre port isolé. Voilà, ce port isolé là ne peut pas communiquer avec un autre port isolé, ça c'est impossible. Il ne peut communiquer que vers les ports promiscuous, c'est-à-dire l'AD, le routeur de sortie.

**[51:55]** On a en fait, on a rentré dans les commutateurs une notion qu'on a bien aimée dans le Wi-Fi et que du coup qui permet d'isoler. Et ça, qu'est-ce qu'on va trouver là ? Eh ben c'est la salle de conférence, ou la salle de réunion de l'entreprise où il y a des extérieurs qui peuvent venir de je ne sais pas où pour présenter des catalogues au patron. Ils veulent Internet : « Ben allez-y, mettez-vous là-dessus. » Le mec il se plugge là-dessus, ben il a Internet, il va... Mais il peut rien faire d'autre ! Il peut aller que sur le port promiscuous qu'on a désigné derrière. Et il ne voit rien, il ne peut pas voir le réseau local, il fait un scan, il n'y a rien. Si, il voit le routeur. Et il ne voit même pas les autres ports isolés de l'entreprise. Très bien !

**[52:45]** Donc l'équivalent du port isolé, c'est le Client Isolation. C'est ce que ça fait, un port isolé il ne peut rien faire, il ne peut pas aller sur des VLANs, il ne peut pas aller sur un autre port isolé, il ne peut aller que sur un port en mode promiscuous qui est configuré promiscuous. Okidoki ? C'est juste on a mis du vocabulaire et on a rajouté cette notion de port isolé qui n'existait pas avant. C'est lié aussi au fait que une machine, on va lui définir des règles dans son VLAN, elle va avoir son propre VLAN, c'est ce qu'on appelle la micro-segmentation. C'est un peu le même principe, sauf que là c'est pour quelqu'un qui ne fait pas partie de l'entreprise. Alors qu'avec le Zero Trust, le port isolé ça peut être un mec de l'entreprise à qui on donne juste les droits d'aller sur ce serveur, ce truc là.

---

### [53:41 - 63:23] MLS, SDN (OpenFlow), abstraction d'administration et conclusion

**[53:41]** Bien. Bon ça, on a... c'est la même chose qu'on avait vu avec les VLANs, j'ai rien à redire. Les switchs de niveau 1, 2 et 3 c'est donc ce qu'on appelle des MLS (*Multi Layer Switch*), donc rien à redire, on a vu ça tout à l'heure. Les associer à des routes et tout ça dans les VLANs, vous connaissez ça par cœur. Il nous reste à voir ça.

**[54:09]** Donc le SDN, donc c'est une espèce d'uniformisation du management des commutateurs alors qu'ils sont dans une... de constructeurs différents. Donc on ne trouve ça que sur des MLS, le SDN. Un switch de niveau 2 basique qui fait que du niveau 2, celui de votre box là, ceux qu'on trouve dans les étages de l'école qui ne sont pas MLS, qui ne sont pas capables de commuter sur des décisions de niveau 3 ou 4, eh ben vous ne trouverez jamais de SDN là-dessus. Il faut déjà avoir un MLS.

**[54:45]** Donc le MLS traditionnel, qu'est-ce qu'on trouve ? On trouve un Cisco, un Allied Telesis, un Alcatel-Lucent dans l'entreprise, chacun avec une matrice, des matrices de commutation (1, 2, 4, 8 matrices de commutation, leur électronique, c'est l'électronique propriétaire du constructeur qui se bat avec les autres sur sa la puissance de frappe, combien de gigas trames par seconde, etc., etc.), et puis au-dessus une couche de contrôle : SSH, l'interface web, l'interface CLI propriétaire Cisco, HP, machin, bidule. Voilà, c'est le truc traditionnel.

**[55:25]** Qu'est-ce qu'amène l'open source là-dedans ? On dit : « OK, vos matrices, vos matrices là, elles sont à vous. C'est votre industrie, c'est avec ça que vous faites de la compétition avec l'autre industriel. On ne va pas toucher à ce qu'il y a en dessous. Mais on va essayer d'uniformiser ce qu'il y a au-dessus, ce qu'on appelle donc le Control Plane. La couche de contrôle. » Et c'est ce qui va se passer, regardez : on va avoir un Control Plane unique. Mais pour que ça fonctionne, il fallait que ces constructeurs-là, ils acceptent de présenter ici une API.

**[56:06]** C'est-à-dire que leur Control Plane là ne donne pas des ordres directement à l'électronique de la matrice de commutation, mais passe par une API. Et c'est après coup que cette API, on va la normaliser et du coup tous les constructeurs vont pouvoir présenter au moins un lot de commandes d'API commun et on va pouvoir faire du coup un Control Plane commun. Ça vous va ça comme explication ? Et donc ça s'est fait bien en deux étapes. Il y a plein de constructeurs qui n'avaient pas d'API, qui donnaient des ordres en interne avec leur CLI à eux mais sans passer par une API. Donc il a fallu déjà que chacun se mette à faire une API, et c'est pour ça qu'il y a des constructeurs qui ne rentrent pas dans le SDN tout de suite parce qu'ils n'ont pas d'API à proposer. En interne, on ne sait pas comment ça marche.

**[56:52]** Et une fois qu'ils en ont une, on sort un lot de fonctions communes. Chacun va avoir son lot de fonctions d'API, lui c'est pareil, mais on va essayer de trouver un lot de fonctions communes qui fait qu'on va pouvoir faire une interface de gestion commune à tout cela. Chacun a le droit de garder des fonctions propriétaires qui lui permettent de se battre avec son voisin, mais on veut un lot commun pour faire la base du réseau : faire des VLANs, faire des VLANs isolés, faire des trucs de base quoi. Après les trucs un peu touchy, oui il faut passer par... Il faut que la concurrence ait lieu pour que les prix baissent.

**[57:38]** Voilà, et donc voilà le terme qui a été employé : on a ce qu'on appelle une API Nord, donc le Control Panel qu'on va... qui est commun, lui-même va proposer une API. Et là du coup, vous imaginez, on va pouvoir mettre directement des applis qui appellent l'API du contrôle pour fabriquer des VLANs automatiques qui descendent sur l'API des constructeurs dans leur lot commun et c'est parti, on peut administrer 50 switchs d'un coup et dire : on va faire un VLAN maintenant avec ça ça ça ça et tous les switchs reçoivent la conf et font ce qu'il faut. C'est ça le Software Defined Network.

**[58:17]** C'est le fait d'avoir cette API commune, donc on appelle ça l'API Sud commune, chacune ont quand même un bout d'API à eux qu'ils veulent garder bien propriétaire et qu'ils vont pas donner aux autres. Ensuite, nous on peut faire donc un outil de contrôle commun qui s'appuie sur ce qu'il y a de commun dans les API de pilotage des matrices de commutation. Et du coup, ce module de contrôle, on en fait une API aussi. Soit on travaille directement avec, soit on propose l'API et du coup vous pouvez développer n'importe quelle app sur Android et puis appeler les contrôles pour fabriquer des VLANs, supprimer des VLANs, enable un port, disable un port, et voilà. Et ça sur un switch ou sur 100 en même temps.

**[59:06]** Et c'est le logiciel libre qui a mis en place... Il n'y a que du logiciel libre là-dedans, aucune solution propriétaire. Personne ne s'est jeté là-dedans, c'est un projet monstrueux. Ceux qui aiment le réseau, c'est peut-être un des projets pour lesquels ça peut être intéressant de commencer à voir comment ça marche, contribuer, parce que là il y a une vraie expertise où il y a peu de gens qui savent comment ça marche. Alors il y a tous ceux qui ont utilisé le Control Panel commun, qui font des stages, OK les bachelors machin tout ça OK, mais comment ça marche en dessous ? C'est autre chose.

**[59:43]** Le projet, il s'appelle OpenFlow. Il est géré par l'Open Network Foundation pour pouvoir fédérer tous les constructeurs et industriels de la planète, Cisco en tête parce que c'est lui qui a posé le plus de problèmes, c'est le premier qui ne voulait surtout pas faire ça. Et du coup, via ce projet OpenFlow là, dans le commutateur, là vous voyez la décision de commutation d'un commutateur qui, par rapport à une entrée dans sa CAM, eh ben c'est fini, il n'y a plus simplement un port et puis une adresse MAC, ça devient compliqué maintenant dans la CAM : on a des adresses MAC, on a des VLANs, on a maintenant des IP sources et destinations parce que c'est un MLS (*Multi Layer Switch*), donc on a des IP, donc décision par rapport à une adresse IP par exemple, et puis ici quelles actions on peut faire ou ne pas faire. Ça commence à être... le switch commence à être... Alors que sa matrice doit être toujours hyper rapide.

**[60:43]** Et donc là on trouve tout un tas d'applications, pour l'instant très propriétaires, HP OpenView en fait partie, qui permettent de piloter donc via l'API Nord toutes les matrices de commutation de N switchs quel que soit leur constructeur. C'est comme ça que marchent les data centers. Les data centers n'ont que des commutateurs MLS compatibles SDN. Et donc l'administrateur du data center, il a une appli, il a tous les VLANs, il a toute l'architecture réseau et il prend des VLANs, il rajoute une machine dedans, il ne sait même pas dans quel switch ça va aller, mais le port il est connu et donc ça va aller dans le bon switch, dans le bon VLAN, en isolé ou pas en isolé. Lui en fait, il ne comprend pas tout ce qu'il y a dessous, il est là sur le fonctionnel. On lui dit : maintenant il faut que la prise numéro 14 du bureau 17 soit dans le VLAN de la R&D, eh ben il prend et il fait du drag and drop comme ça, il ne sait même pas quel switch va réagir derrière. Il a une notion d'abstraction complète du réseau.

**[61:58]** Et tout ça, ça fonctionne avec... Donc là moi, ceux qui aiment bien le réseau et qui veulent franchement aller chercher une expertise pour se distinguer des autres, il y a peut-être une piste. Il y a sûrement une piste. Maintenant, vos métiers ça sera les opérateurs de cloud et les data centers. Dans une entreprise, on n'en est pas là. C'est que dans les data centers pour l'instant tout ça. Je ne connais pas d'entreprise qui a basculé en SDN. Vous faites des alternances, vous me direz le contraire. Mais là il y a quelque chose à faire, une vraie évolution, c'est beaucoup plus technique, il y a de tout : il y a du dev, il y a de l'architecture, il y a la connaissance du réseau. En fait à chaque fois qu'on rajoute des briques de compétences, les gens disparaissent et à la fin il ne reste plus grand monde. Allez là-dedans bordel ! Dans ces trucs là qui sont complexes. C'est bon ?

**[63:23]** *[Fin du cours et de l'enregistrement]*


# Partie 2 — Normalisation, OSI vs TCP/IP, IoT, SMB et classes IPv4 (≈ 21 min)


**Fichier source :** `Nouvel enregistrement 2.m4a`  
**Durée :** 21 minutes (21:23)  

---

### [00:00 - 03:51] Normalisation IEEE / IETF, Modèle OSI vs Architecture TCP/IP

**[00:00]** *[Bruits de salle / installation]*

**[00:14]** Donc on a terminé de... Bon on a fait le tour de ce qu'il y a à l'intérieur des commutateurs, hein. J'ai pas... Il n'y a pas beaucoup plus de choses, c'est déjà pas mal. Vous pouvez voir que un bon commutateur, ça peut vous faire la sécurité du réseau local et puis un pirate, si vous activez tout ce qui est activable, eh ben il peut se lever tôt pour pénétrer le réseau local, même un pirate interne par définition.

**[00:48]** Maintenant, il y a très très peu d'entreprises qui mettent ça en œuvre parce qu'elles connaissent pas, parce qu'elles n'ont pas le bon matos, parce qu'elles n'ont pas les bons spécialistes. C'est à vous d'expliquer qu'on peut très bien sécuriser un réseau local avec tout ce qu'on a vu qui existe dans le commutateur et dans les usages. Voilà, le quiz vous l'avez fait.

**[01:08]** Donc on peut monter dans les couches. On est toujours dans les rappels en mettant des petits focus particuliers sur certains équipements. Et donc on va monter dans les couches, on va monter sur IP et puis quelques services. Et puis ensuite, on pourra commencer le cours.

> 💼 **[VOCABULAIRE & NORMALISATION] Modèle OSI vs Architecture TCP/IP :**
> - **IEEE :** Normalise les couches 1 (Physique) et 2 (Liaison).
> - **IETF :** Normalise via les **RFC** les couches 3, 4 et applicatives.
> - **Différence OSI vs TCP/IP :** Les couches 5 (Session), 6 (Présentation) et 7 (Application) du modèle OSI correspondent à l'unique couche **Application** de l'architecture TCP/IP.

**[01:26]** Bien, donc je vous rappelle bien les couches supérieures. En dessous on s'appuyait sur l'IEEE qui a normalisé quasiment toutes les couches inférieures 1 et 2. Et à partir de la couche 3, c'est plutôt l'IETF qui a pondu des documents qui s'appellent des Requests for Comments (RFC) et dans lesquels on décrit tous les protocoles, quasiment 90% des protocoles des couches 3, 4 et applicatives.

**[01:50]** Je vous rappelle que le modèle... Enfin ça s'appelle pas un modèle, dans le vocabulaire c'est l'architecture TCP/IP, ne correspond pas exactement au modèle OSI puisque la couche 5, 6, 7 du modèle OSI en fait c'est la couche applicative de l'architecture TCP/IP. Le vocabulaire, c'est celui-là.

**[02:12]** Mais bon, tout vient... Tout a été décrit dans des RFC qui portent des numéros en fonction des protocoles. On a deux parties dans l'Internet Society, qui est une association de droit américain, comme nos associations de 1901 un petit peu. Il y a un peu de différence, ils peuvent faire de l'argent, il y a plein de choses comme ça que nos assos ne peuvent pas faire.

**[02:33]** Et donc une partie administrative où on gère les DNS et les adresses IP de la planète, et une partie plutôt R&D et technique où on gère la partie protocoles. Ça vous connaissez.

**[02:46]** À titre d'exemple, ben voilà l'empilement. Donc voici l'architecture TCP/IP, pas le modèle TCP/IP. En effet, ça correspond à 1, 2, 3, 4, 5, 6, 7 du modèle OSI avec quelques exemples de protocoles bien connus et leur RFC relative. D'accord ?

**[03:07]** Donc si à un moment donné vous devez développer les sockets et réimplémenter un protocole parce qu'on vous le demande pour faire des modifs dessus, pourquoi pas pour fabriquer un protocole propriétaire. Il y a tout un tas d'entreprises qui se sont pas embêtées, qui ont pris une RFC d'un protocole connu, surtout sur la partie applicative, ils partent de quelque chose de connu et ils le modifient pour que ça devienne un protocole propriétaire. Tout le monde fait ça. Les protocoles de jeux sont tous faits comme ça, quasiment.

**[03:39]** Et donc voilà, vous avez donc les RFC qui vous permettent d'avoir la description des protocoles. À droite, vous avez les équipements qui sont positionnés et puis le vocabulaire. Ça vous le savez, donc on ne va pas s'appesantir.

---

### [03:51 - 08:02] Protocoles IoT sans fil longue distance (LoRa vs Sigfox) et réseaux Mesh

**[03:51]** Si on regarde donc par rapport au modèle, si on compare l'architecture par rapport au modèle, l'architecture TCP/IP, on s'aperçoit que donc dans les couches basses l'IEEE a quasiment fait la majorité des protocoles qu'on utilise aujourd'hui. Il reste les constructeurs, donc des protocoles propriétaires des couches inférieures.

> 💡 **[LPWAN RADIO IoT] LoRa vs Sigfox :**
> - **Radio longue distance très bas débit (15 à 100 km, quelques kbps).**
> - **Sigfox (fermé) :** Modèle avec passerelles propriétaires sous abonnement.
> - **LoRa / LoRaWAN (ouvert) :** Déploiement libre de passerelles privées et serveurs de données, soutenu massivement par les opérateurs (Orange, SFR).

**[04:11]** LoRa, ça reste quelque chose de propriétaire. L'IEEE est en train d'étudier le fait de lui donner un numéro parce que c'est tellement déployé. Je vous rappelle que LoRa a été en concurrence avec deux autres... LoRa, c'est de la radio longue distance, très bas débit. Radio, longue distance, très bas débit. Longue distance, c'est 100 km.

**[04:34]** Donc un petit objet connecté, un capteur de température sur une cheminée, va envoyer son information via LoRa jusqu'à la gateway, donc une passerelle comme la BTS pour le GSM ou comme le point d'accès Wi-Fi pour le Wi-Fi, à une passerelle LoRa qui est à... qui peut aller jusqu'à 100 km, ce qui est pas mal hein ! C'est juste un petit capteur de température qui est gros comme une pile bouton qui va envoyer une température toutes les minutes à 100 km. C'est quand même plutôt sympa.

**[05:01]** Alors c'est très bas débit, il ne faut pas commencer à imaginer des trucs de streaming, on est dans les kilobits par seconde, mais pour les objets connectés, pour les capteurs, ça suffit amplement.

**[05:11]** LoRa s'est battu... enfin s'est battu, il y a eu une concurrence pendant une dizaine d'années de trois protocoles : un américain, deux français, sur cet usage de la radio longue distance, très bas débit. Le protocole américain a arrêté au bout de 2 ans, ils ont dit « Je ne peux pas lutter contre les deux protocoles français ». Et les deux protocoles français sont LoRa et Sigfox.

**[05:37]** Tous deux se sont battus pendant 5 ans pour essayer d'avoir... Deux modèles économiques différents ! Des technologies assez proches, mais deux modèles économiques différents. Sigfox a décidé de déployer ses passerelles (les passerelles Sigfox) et les clients ont un abonnement passerelle. C'était le modèle économique de Sigfox. C'est en Vendée.

**[06:05]** LoRa, c'est un autre modèle économique : c'est n'importe qui peut mettre des passerelles LoRa, il y a une règle d'usage et on ne paye que les data centers qui hébergeront les données à la fin. Ou alors on fait son propre data center, on a sa propre gateway LoRa et on peut tout faire soi-même. Vous comprenez que ça, ça a plutôt plu, cette liberté.

**[06:30]** Et du coup, SFR, Orange se sont adossés à LoRa très rapidement. Bon ben quand Orange s'adosse à quelque chose... Orange, pour information, c'est la plus grosse entreprise de télécoms mondiale ! Mondiale ! Il y a Orange France, mais vous regardez, Orange c'est partout sur la planète. Avec des noms différents, c'est Orange qui est derrière. Et ils rachètent à tour de bras. Il n'y a pas un mois où Orange ne rachète pas la majeure télécom de tel pays d'Afrique, de tel pays à côté de l'Inde, je sais pas quoi. C'est un monstre ! C'est un monstre.

**[07:03]** Donc quand Orange a dit « Ben moi ça sera LoRa », bon ben la messe était dite. Donc Sigfox a disparu. Enfin disparu... Il finit sa vie tranquillement. LoRa devient le seul système longue distance, bas débit en radio. Donc du coup, l'IEEE s'y intéresse puisque puisqu'il n'y en a qu'un, autant le normaliser. Et à la fin, ça finira en 802.quelque chose. Ça sera une norme IEEE. Très intéressant, mais pour l'instant ça reste un protocole constructeur.

**[07:37]** Z-Wave et Matter, c'est pour les objets connectés dans la maison. Ils s'appuient sur un protocole qui n'est pas le Wi-Fi, qui est justement Z-Wave ou Matter. Un réseau Mesh. Des équipements, s'ils sont en Matter ou en Z-Wave, se créent un réseau Mesh entre eux. Un petit peu ce qu'on a dit hier avec le Wi-Fi et les téléphones portables où on pourrait, nous citoyens, faire notre propre réseau Mesh. Sauf que là c'est à la dimension de la maison.

---

### [08:02 - 11:20] Protocole SMB (Microsoft), blocage WAN et projet Samba sous Linux

> 🎯 **[POINT EXAMEN / PORTS BLOQUÉS] SMB & Samba :**
> - **SMB (Port 445 / 139) :** Conçu par Microsoft pour les réseaux locaux (LAN). Émet des micro-paquets dès que 2 octets (voire 1 bit) sont prêts.
> - **Blocage WAN :** Tous les routeurs d'opérateurs sur Internet bloquent SMB car son bavardage saturerait les tables de routage.
> - **Samba :** Rétro-ingénierie libre sous Linux permettant d'assurer le partage de fichiers et de créer un contrôleur de domaine Active Directory complet (coût licence = 0).

**[08:05]** Bon voilà, rien d'autre à dire. En haut, ben on étudiera un petit peu ce protocole quand on fera... quand on fera quoi, je sais pas quoi, audit et contrôle je crois, qui est donc le protocole de Microsoft. C'est avec ce protocole que Microsoft fait tout dans le réseau local. C'est un protocole de réseau local. SMB est interdit par les routeurs, il est bloqué par tous les routeurs de la planète.

**[08:26]** Vous ne faites pas un répertoire partagé Windows entre vous et votre copain en Afrique, ça n'existe pas. D'ailleurs, ça viendrait à l'idée à personne de le faire. Pourquoi ? Ben parce que ceux qui essayent, ça marche pas ! Et oui, ça marche pas parce que les routeurs le bloquent.

**[08:40]** Parce qu'il est tellement pas designé pour le WAN (les réseaux longue distance), il a été designé par Microsoft pour le LAN, pour être dynamique, c'est-à-dire dès qu'il y a 2 octets à envoyer on les envoie. Alors en temps réel super, ça fait un paquet IP avec 2 octets de data. Si vous faites passer ça sur les routeurs d'Internet, les routeurs ils passent tous dans le rouge pour router des pauvres paquets avec très peu de données dedans. Donc ils n'en veulent pas !

**[09:04]** Donc c'est les opérateurs qui ont bloqué SMB. C'est Free, c'est SFR qui ont décidé de leur propre chef de dire : ça, ce protocole-là, si on le laisse tourner sur Internet, les mecs vont faire des répertoires partagés, des imprimantes partagées entre les États-Unis et la Chine, ça va nous bouffer nos routeurs ! Donc on l'a... C'est pas une norme, mais tout le monde le verrouille.

**[09:25]** Il reste contenu dans le réseau local où il est très très très efficace puisqu'il a été designé pour ça. Dès qu'il y a 2 octets à envoyer, on les envoie. Alors que tous les autres protocoles que vous avez ici là, qui sont orientés WAN, on attend qu'il y ait assez de données pour faire un paquet et l'envoyer sur Internet pour que les routeurs aient quelque chose à router quoi, pas juste des trucs de merde.

**[09:51]** Vous voyez un peu la philosophie protocole LAN, protocole WAN ? Microsoft voulait un protocole très réactif sur les réseaux locaux, donc il s'est autorisé à... Il y a même des trames de chez Microsoft qui ont une zone de données (de data) et dedans on peut y trouver un bit ! Ils ont fait ça avec SMB. Autant dire que ce genre de paquet, il faut surtout pas le trouver sur Internet. Pour le routeur qui doit router un bit, il a mal au cul quoi ! C'est quoi ce bordel ?

**[10:23]** Donc voilà, j'en parle, il est propriétaire. On n'a pas de data sheet, on n'a pas de document. Microsoft ne publie pas grand chose sur SMB. Donc pour pouvoir avoir SMB sous Linux, eh ben il faut faire de la rétro-conception sur le réseau pour essayer de deviner, faire des hypothèses, et ça devient le projet Samba que vous pouvez mettre sur un Linux pour pouvoir vous connecter à un Windows, pour pouvoir partager une imprimante avec un Windows, pour faire un Active Directory avec un Linux (c'est tout à fait possible, de faire un AD full Linux, coût zéro, faut mettre les mains dans le cambouis mais ça fonctionne très bien).

**[11:01]** Et donc ça, on implémente Samba qui est le projet libre qui essaye de suivre SMB parce que tous les... dès qu'il y a un Service Pack qui sort de Microsoft, clac, ils modifient SMB à chaque fois. C'est de bonne guerre, c'est très bien qu'ils modifient à chaque fois, ils font chier le logiciel libre.

---

### [11:20 - 15:16] Adressage IPv4 historique par classes (A, B, C, D, E)

> 🎯 **[POINT EXAMEN / REPERES D'ADRESSAGE CLASSE]**
> - **Classe A (/8) :** 0 à 127 | 128 réseaux de 16M machines.
> - **Classe B (/16) :** 128 à 191 | 16 384 réseaux de 65k machines.
> - **Classe C (/24) :** 192 à 223 | 2M réseaux de 256 machines.
> - **Classe D :** 224 à 239 | Multicast.
> - **Classe E :** 240 à 255 | 16 blocs /8 réservés tests (jamais libérés).
> - **Loopback :** `127.0.0.0/8` (pile locale, ex: `127.0.0.1`).

**[11:20]** Donc pour la partie administrative, je ne vais pas... on ne va pas refaire le plan d'adressage IP, juste vous rappeler comment à l'origine il avait été décrit ce plan d'adressage : donc 4 octets pour définir une adresse IP. Ces 4 octets constituent un pôle de 4 milliards d'adresses IP.

**[11:39]** Et ces 4 milliards d'adresses IP, eh ben il a été décidé de le couper en trois. Donc je coupe en deux les 2 milliards d'adresses IP pour les très gros réseaux de 16 millions de machines (donc 256 réseaux de 16 millions de machines), et puis ce qui reste des 2 milliards qui restent, je les coupe encore en deux : je fais 65 000 réseaux de 32 000 machines et je fais 65 000 réseaux de 256 machines.

**[12:06]** Ça c'est la façon dont l'IANA, tout au début, en 90 a dit qu'il allait déployer le plan d'adressage IP sur la planète. Les grandes entreprises pourront avoir des très gros réseaux de 16 millions de machines (des très gros LANs de 16 millions de machines, mais il y en a peu), et puis les entreprises moyennes elles sont là, et puis les petites et TPE/PME elles seront là. C'est un peu comme ça qu'ils ont designé le truc.

**[12:42]** Mais à l'époque, personne n'avait Internet. Ça n'existait pas, on n'avait pas Internet pour une machine, pour une maison. Je suis même pas sûr qu'ils aient vraiment imaginé que le peuple de cette planète utilise ce réseau un jour. C'était pour le business. C'est américain : le business, le business.

**[13:00]** Bon ben vous avez compris que faire ça, c'est juste pas possible. Donc voilà ce que ça a donné : ce qu'on appelle la classe A, la classe B et la classe C. Classe A, classe B, classe C. Et c'est avec le premier bit qu'on joue et qu'on distingue si on est sur une classe A, classe B, classe C, si on est plutôt dans cette partie du plan d'adressage, celle-là ou celle-là.

**[13:22]** On a de la réserve derrière : à partir de 224 jusqu'à 255, on a quand même de la place. Et donc on a le Multicast IP sur un paquet d'adresses quand même, c'est pas rien. Et puis il y a quand même 16 réseaux de classe A là, de 240 à 255, 16 réseaux de classe A de 16 millions de machines pour les tests ! Waouh !

**[13:50]** Voilà, et ça ça n'a toujours pas bougé. Quand on vous dit qu'il y a pénurie, calmez votre interlocuteur : « Ben ils ont qu'à déjà libérer les 16 réseaux de 16 millions de machines là ! » On verra après pour les 16 millions d'adresses IP.

**[14:05]** Bien, plus cette 127 que vous connaissez par cœur puisque on vous fournit un classe A pour votre propre pile IP de votre machine. Chacun a cette classe pour lui pour faire ce qu'il veut, pour faire tourner ses VM (une VM en 127.0.0.2, une VM en 127.0.0.3, une VM en 0.0.4) et puis vous les faites communiquer entre elles, ça marche tout seul. Sachant que 127.0.0.1 vous ne pouvez pas le prendre parce que c'est votre pile TCP.

**[14:34]** Voilà. Donc ça c'est de la merde, mais on ne peut pas leur jeter la pierre. Quand ils l'ont designé, personne n'a trouvé à redire, tout le monde a dit : « Ouais bravo, c'est très bien. » Et puis c'est l'usage d'Internet qui fait qu'on s'aperçoit : ben non, on n'avait pas prévu qu'on connecte des brosses à dents, des gaufriers, des chiottes électroniques, des je sais pas quoi, et que du coup ça devient du grand n'importe quoi ! Il va falloir... On est complètement en pénurie et qu'on pourrait avoir une adresse IP pour une machine directement sur Internet : une machine = une adresse IP. Ça c'était pas designé. Pour eux c'était des réseaux LAN, pas une machine.

---

### [15:16 - 21:23] Gouvernance mondiale de l'adressage (ICANN, RIR, LIR et ASN)

**[15:16]** Bon, donc on ne garde de cette historique une seule chose : c'est le vocabulaire. La notion de classe reste. Classe A c'est 16 millions de machines, classe B c'est 65 000 machines, une classe C c'est 250 machines. De taille de réseau, OK ? Il n'y a que ça qui reste. Mais le partage là qui a été fait, tout ça ça a explosé. Mais la notion de classe reste. On peut vous dire « Tiens, fais-moi... donne-moi un plan d'adressage IP d'un réseau de classe B », c'est pas déconnant. En terme de vocabulaire, ça peut rester. C'est-à-dire que vous vous débrouillerez sur votre /16 comme vous voulez.

> 💡 **[GOUVERNANCE INTERNET] IANA, RIR et LIR :**
> - **ICANN / IANA :** Coordination mondiale de la racine IP/DNS.
> - **RIR (5 mondiaux) :** RIPE NCC (Europe/Moyen-Orient), ARIN (Amérique du Nord), APNIC (Asie), LACNIC (Amérique Latine), AFRINIC (Afrique).
> - **LIR (Local Internet Registry) :** Opérateurs télécoms disposant d'un numéro d'**AS (Autonomous System)** habilités à acheter et router les blocs d'adresses.

**[15:59]** Donc comme l'IANA a merdé, ben on lui a mis un patron, quelqu'un au-dessus qui dit « Bon ben maintenant tu vas pas faire tout seul le rigolo ». Donc l'ICANN a été créée à ce moment-là pour un peu réorganiser cette gestion des adresses IP et des noms de domaine, et il a été décidé de décentraliser complètement, de ne plus laisser tout ça aux États-Unis dans cette asso, mais de l'exploser sur la planète avec des sous-centres de l'IANA qu'on appelle les registres régionaux (RIR) qui vont gérer leur zone en adresses IP et en noms de domaine. OK ?

**[16:43]** Donc voilà comment ça a été organisé. Et ensuite, quand je veux acheter une adresse IP, quand je veux acheter un nom de domaine, je m'adresse au RIR de ma zone géographique. Donc le RIR européen qui s'appelle le Réseau IP Européen (RIPE), parce que le français étant une langue universelle, c'était écrit en français. Le reste est tout en anglais, mais celui-là c'est écrit en français : Réseau IP Européen.

**[17:11]** Qui est en Hollande, donc c'est le control center du RIPE. Eh ben ses clients sont tous les opérateurs de communication. Pour acheter des adresses IP, pour acheter des noms de domaine. Il faut être opérateur de communication pour avoir le droit d'acheter des /25, des /24, des /26 et des noms de domaine auprès du RIPE. C'est-à-dire qu'il faut avoir... Si on est français, il faut avoir un numéro de SIRET dont les 4 premiers chiffres définissent opérateur de communication.

**[17:42]** Si vous êtes boulanger dans votre numéro de SIRET, vous ne pouvez pas... enfin si, vous pouvez les contacter, mais ils vont vous dire : « Non, je ne peux pas vous vendre à vous. Vous, si vous voulez acheter une adresse IP et un nom de domaine, adressez-vous à vos opérateurs de communication. » On sent le système américain où chacun doit faire son business. Américainement ! C'est leur modèle. Tout le monde fait de l'argent, chacun prend sa part de la confiture.

**[18:14]** Et donc les opérateurs de communication s'appellent des LIR (*Local Internet Registry*). Et c'est vous qui tapez ici. Quand on est opérateur de communication, on est identifié en France par un numéro de SIRET, mais ça c'est l'administration française. Par rapport à l'administration de l'IANA, on doit demander un numéro d'AS (*Autonomous System*). Parce que il y a des entreprises françaises, allemandes, belges, même russes. L'Europe ils ont pas mal de monde là-bas. Et eux, il n'y a pas de numéro de SIRET comme en France.

**[18:56]** Donc il a été inventé le numéro d'ASN. Donc ça identifie un LIR, et c'est là qu'ils vérifient que vous êtes bien opérateur de communication, que vous allez faire du business avec les DNS et les adresses IP et des choses comme ça. Et à partir du moment où vous avez un numéro de système autonome (vous allez voir que ça correspond aussi à l'organisation du réseau IP derrière), eh ben vous pouvez vendre. Vendre à qui vous voulez. Vous pouvez acheter déjà, et puis...

**[19:30]** L'ESIA a son propre AS puisque le labo a une patte sur les infrastructures cœur de réseau d'Internet pour faire ce qu'on a à faire. Donc ça se fait que dans la zone sécurisée du labo, et c'est que dans une salle particulière. Et c'est que des militaires qui ont le droit de travailler, c'est pas les étudiants.

**[19:54]** Bien, donc oui on a un LIR, ne me demandez pas comment on a réussi à se faire passer pour opérateur de communication, ce n'est pas une information qui est publique. Cependant, nous existons. Et donc vous pouvez voir notre plan d'adressage en /24 qui nous appartient en IPv4 et notre plan en /29 IPv6, donc on a plusieurs milliards d'adresses IPv6 à disposition pour faire ce qu'on veut.

**[20:30]** Bien, donc OK pour ça. Donc c'est l'organisation aujourd'hui mondiale. Et quand vous achetez, avant on n'achetait que du /8, /16, /24, aujourd'hui on peut acheter du /26, /28, nous on a acheté du /29 là. On achète ce qu'on veut.

**[20:56]** L'adressage IP, je ne reviens pas dessus, vous le connaissez par cœur. Il y a la correction, vous ferez ça ce soir à tête reposée avant de vous coucher. Donc on fait un petit quiz ?

**[21:23]** *[Fin du cours et de l'enregistrement]*


# Partie 3 — Anycast, IPv6, subnetting, NAT44 et CGNAT (≈ 36 min)


**Fichier source :** `Nouvel enregistrement 3.m4a`  
**Durée :** 36 minutes (36:19)  

---

### [00:00 - 02:16] Routage Anycast et fonctionnement des CDN (Netflix, YouTube, DNS Racines)

> 💡 **[ROUTAGE ANYCAST]** Une même adresse IP est diffusée par BGP à plusieurs endroits de la planète. Les routeurs acheminent le paquet vers le serveur le plus proche en sauts réseau ou le moins chargé (DNS racines A à M, Netflix, YouTube).

**[00:00]** Unicast... 1 vers 1. Il y a un mode de diffusion qu'on reverra en cours, parce que je crois que on n'insiste pas assez dessus, c'est l'Anycast. Lisez le tableau là.

**[00:28]** Donc sur le réseau WAN, donc sur des réseaux à grande distance, ce qu'on appelle l'Anycast, c'est le fait que vous avez plusieurs fois la même adresse IP répétée sur le réseau, à plusieurs endroits, souvent c'est à plusieurs endroits géographiques différents.

**[00:46]** Et le système de routage va vous rediriger vers... Il y a plusieurs politiques : soit le plus près en terme de distance (une distance en réseau c'est un nombre de sauts, c'est pas un problème de kilomètres, c'est le nombre de sauts de réseau), soit le plus près ou à celui qui est le moins chargé pour faire du délestage de charge.

**[01:10]** C'est ça l'Anycast. Et donc quand on reverra un peu plus tard les protocoles de routage d'Internet, et notamment les attaques sur ces protocoles de routage, d'où le fait qu'on puisse être au cœur d'Internet pour attaquer l'infrastructure Internet ou la défendre (moi je suis plutôt dans la défense), eh ben c'est ce protocole de routage Internet qui va définir vers où.

**[01:36]** Et c'est comme ça que fonctionne Netflix, que fonctionne YouTube, que fonctionne tout ça. Vous êtes redirigés vers tous le même serveur, mais ce serveur va dépendre en fonction de votre situation géographique pourquoi pas, mais surtout de la charge des infrastructures. Tout ça ça se fait par Anycast, donc il y a une propagation Anycast. On reverra ça quand on fera du routage.

---

### [02:16 - 07:01] Pénurie IPv4 et véritable rôle d'IPv6 (Routage Géographique & Hiérarchique)

> 🎯 **[POINT EXAMEN / CONCEPTION IPv6]** Pourquoi IPv6 ? L'objectif majeur n'était pas seulement le nombre d'adresses ($2^{128}$), mais la **refonte du routage mondial** : adressage hiérarchique et géographique permettant aux routeurs de cœur d'Internet de router par simple lecture des premiers octets sans parcourir des tables de routage anarchiques.

**[02:16]** Donc on voit qu'on va être en pénurie avec nos 4 milliards d'adresses qui vont se faire étouffer par le nombre de besoins grandissants. D'où l'idée de créer assez rapidement un protocole qui va remplacer IPv4 avec plusieurs objectifs. C'est pas qu'un seul objectif d'avoir plus d'adresses IP. Ça c'était vraiment... oui c'en est un, mais c'est pas le principal.

**[02:44]** Le principal objectif d'IPv6, c'était d'améliorer le système de routage sur Internet. Aujourd'hui le système de routage avec IPv4, il est tout mal foutu, il n'y a pas de notion de géographie. Il n'y a pas de notion de géographie dans IPv4. Une adresse IPv4 est en Inde, la suivante peut être aux États-Unis, la suivante est en France. Et donc du coup les routeurs, ils ont un listing de tous les plans d'adresses de la planète sans cohérence. Chaque routeur, tous les routeurs d'infrastructure ont toutes les routes !

**[03:18]** C'est un truc de débile. Et donc quand un paquet arrive dans le premier routeur, le premier routeur est obligé de checker toutes les routes pour savoir ce paquet où est-ce qu'il va l'envoyer. Il tombe sur le routeur d'après qui checke toutes les routes pour voir où est-ce qu'il... Enfin c'est un truc de débile, ça ne marche plus ! D'où la latence qu'on a sur Internet, les gamers qui se plaignent, etc., etc., parce que les routeurs sont dans le rouge, tous.

**[03:42]** Il faut réorganiser ce système de routage qui n'est pas du tout efficace. IPv6 amène ça avec un système de routage géographique. Les premiers octets définissent en IPv6 où vous êtes sur la planète. Ce qui fait qu'en fait les routeurs, ils ne vont pas chercher à comprendre : ils vont regarder une adresse IPv6, ils prennent les trois premiers octets et ils disent « OK, direction l'Inde. OK, direction les États-Unis », et ils regardent que ça !

**[04:04]** Ils ne regardent pas tous les plans d'adressage pour trouver le bon dedans. Ils vont faire par dichotomie où clac, ça part là-bas. Le deuxième routeur il dit « Ah ben tu es bien en Inde, c'est bien au bon endroit, et maintenant ah tu vas plutôt dans cette zone-là. » Vous voyez ce que je veux dire ? Et du coup on va avoir un système de routage en IPv6 mais qui est 10, 20 fois plus efficace qu'en IPv4 avec une rapidité de routage qui est monstrueuse. Alors qu'en IPv4 c'est une vraie plaie.

**[04:31]** Donc IPv6 a d'abord été designé pour changer la logique de routage qui n'est plus liée à des plans d'adresses mais liée à la géographie. Et on balance comme le DNS un peu, chacun fait sa zone et puis ensuite on descend.

**[04:49]** Deuxième chose en effet, il faut rajouter des adresses IP parce que la planète on a besoin et donc on a fait un petit nombre d'adresses IP par mètre carré de terre qui fait qu'on est capable de voir. Mais ça a été prévu pour que justement, dans ces... Comme je vous ai dit, les trois premiers octets c'est la géographie, il y a des octets qui sont prévus pour d'autres planètes de notre système solaire et il y a des octets prévus pour d'autres systèmes solaires.

**[05:14]** Vous voyez, on a quand même vu un peu plus loin. Tout est prévu de sortir de la planète, voire de sortir du système. Et on pourra faire de l'adressage, on en aura assez jusqu'à preuve du contraire. Pour l'instant, on a une petite marge de manœuvre.

**[05:35]** Donc voilà, comme je vous l'ai dit, les deux... les blocs là, les trois premiers blocs vous permettent d'avoir un préfixe de géographie, de hiérarchisation, ce qui va faire que les routeurs, les premiers routeurs qui vont trouver vos paquets, ils ne vont pas être obligés d'analyser toute votre adresse IP et votre masque pour ensuite checker dans quel réseau vous voulez aller et du coup quel routeur envoyer.

**[05:59]** Non, ils ne vont pas chercher à comprendre : à la lecture des trois premiers blocs, ils envoient... déjà ils dirigent au bon endroit, tout de suite. Sans chercher, sans avoir à checker je ne sais pas quelle table de routage. C'est les routeurs finaux qui auront peu de routes (puisqu'il y aura peu de routeurs) qui décideront dans quel réseau vous allez atterrir.

**[06:22]** Ça sera sacrément plus efficace, d'accord ? Vous avez donc la localisation, le sous-réseau, c'est à cet endroit-là, dans ces routeurs de fin de cycle, qu'on aura des tables de routage. Les premiers, ils n'auront même plus de table de routage ! Ils liront les trois premiers octets comme un commutateur Ethernet.

**[06:37]** Qu'est-ce qu'on a fait là ? On a fait ce qu'a inventé Ethernet : adresse MAC, boum, tu vas à tel port. Eh ben là on fait la même chose : trois blocs, pouf, tu vas aux États-Unis, pouf tu vas en Afrique du Sud. Il n'y a pas de table de routage, c'est immédiat. Et à la fin, on aura une table de routage pour distinguer au sein de la ville à quel endroit aller.

---

### [07:01 - 14:21] Techniques de mitigation IPv4 : Libération de /8 et Subnetting /30 vs /31 (RFC 3021)

**[07:01]** Bien. Bon voilà. Avant de pouvoir profiter pleinement d'IPv6, eh ben il y a de la transition. La transition, elle est prévue sur 50 ans. Pourquoi ? Ben parce qu'il y a des équipements, ils n'ont même pas IPv6 dans le firmware. C'est même pas designé. Des satellites qui tournent, IPv6 ils ne l'auront jamais. Jamais jamais jamais.

**[07:25]** Il y a des sondes dans des pipelines de pétrole, ben jamais il n'y aura IPv6 dans ces sondes-là. Il y a des montres connectées qui n'auront jamais IPv6. Voilà, il y a des PC sur la planète qui n'auront jamais IPv6. On ne peut pas ceux-là les éradiquer d'un coup de cuillère à pot. On va être obligés d'attendre et donc de cohabiter pendant de suite.

**[07:48]** Donc avant ça, il faut qu'on puisse mitiger un petit peu la pénurie. Donc eh ben on va libérer des /8 qui ont été affectés à des entreprises qui vont les libérer. Alors c'est elles-mêmes qui doivent les libérer, on ne peut pas les obliger à le faire. On va faire du NAT, donc c'est ce qu'on fait avec votre box : vous avez peut-être 15 machines dans votre réseau local, mais vous allez gaspiller qu'une seule adresse IP publique, ce qui permet de ne pas de ne pas affecter 15 adresses IP publiques parce que j'ai 15 équipements dans mon appart.

**[08:26]** Et puis on va permettre d'arrêter de faire du /8, /16, /24. Maintenant, on peut affecter des réseaux en /30 aux entreprises. Avant, une entreprise, elle avait... son plus petit réseau public, toutes les machines étaient publiques, c'était 256. Vous imaginez, elle a que 4 serveurs à mettre en exposition Internet : un serveur web, un serveur DNS forcément, un serveur multimédia et un serveur de fichiers. Pourquoi on va lui filer 255 adresses alors que 4 suffisent ? Maintenant on lui file un /30 ou un /29. Ça permet de... mais pour ça, il faut récupérer ce qu'on a donné aux entreprises du tout début. C'est pas toujours simple.

**[09:07]** Donc voilà quelques entreprises qui ont rendu... Alors entreprises ou universités, ce que vous voulez. Donc très bien, on récupère à chaque fois quand même 16 millions de machines... 16 millions d'adresses pardon. Plutôt sympa. Linus Torvalds qui a décidé de rendre le réseau 0/8 routable. Il avait été décidé que 0/8 c'était bizarre. C'était un réseau bizarre, le réseau zéro. Jamais personne ne routait zéro et personne ne s'était... C'était marqué nulle part que le réseau zéro était réservé pour tests ou je ne sais pas quoi. Simplement personne ne voulait utiliser ce réseau-là.

**[09:43]** Et donc les routeurs Cisco, qui étaient les premiers routeurs d'Internet, ont interdit le réseau zéro. On ne sait pas pourquoi, Cisco avait décrété que... Donc le noyau Linux derrière s'est adossé, il a fait la même chose. Puis un jour Linus il s'est réveillé un matin, il a dit « Mais c'est quoi cette connerie ? Allez, je libère ! » Donc dans un noyau il a dit : « Le réseau zéro sera routé comme tous les autres. » Et comme aujourd'hui 80% des routeurs c'est le noyau Linux, ben le réseau zéro d'un seul coup s'est retrouvé routé comme tout le monde. Et donc l'IANA l'a découpé et l'a affecté à des acheteurs. Il a été découpé en plein de sous-réseaux en /30, /28 et il sert à être affecté. Mais sur une décision d'un mec !

**[10:28]** Donc il reste des /8 non rendus. Il y a des entreprises qui gardent parce qu'ils savent qu'une adresse IPv4 il y en a de moins en moins, la pénurie faisant le commerce, eh ben ils attendent que ça coûte un peu plus cher pour le vendre. Voilà, donc sur Wikipédia vous trouvez les quelques entreprises, entités plutôt américaines qui ont gardé des /8 en attendant que ça prenne de la valeur pour faire du business.

**[10:54]** Maintenant, faut pas rêver hein, on a vu que de 240 à 255/8, 16 réseaux sont en mode test. Ben ils sont toujours dispo ! Qu'ils arrêtent de nous dire qu'il y a pénurie, on ne fait plus de tests en IPv4, c'est bon, depuis les années 80 on les a faits les tests. OK, ils vont peut-être libérer, mais libérer putain quelque chose là !

> 🎯 **[POINT EXAMEN / RFC 3021] Liaisons point-à-point en /30 vs /31 :**
> - **En `/30` (masque `255.255.255.252`) :** 4 adresses (1 réseau + 2 hôtes + 1 broadcast). On gaspille 50% des adresses pour relier 2 routeurs.
> - **En `/31` (RFC 3021, masque `255.255.255.254`) :** 2 adresses hôtes seulement, sans IP réseau ni broadcast. Réduit de 50% le gaspillage sur les liens inter-routeurs.

**[11:23]** Donc en attendant, on va donc faire du NAT pour éviter de gaspiller ici. Donc le NAT consiste déjà en premier point à créer des réseaux privés, donc définir des adresses IP, des plans qui ne seront jamais routés par les routeurs d'Internet. Les voici, les 4 plans que vous devez connaître par cœur, il n'y a pas le choix. En attendant IPv6, il faut les connaître.

**[11:46]** Et ces 4 plans là ne seront jamais routés par les routeurs d'Internet et sont réservés pour vos réseaux locaux : domestiques, d'entreprises, d'industries, de ce que vous voulez. Et vous n'exposerez à l'extérieur qu'une adresse IP publique qu'il vous faut acheter là (1, 2, 4, 8, 16, autant que vous voulez en fonction de votre pognon), mais vos réseaux locaux qui sont dans un ou dans plusieurs de ces plans seront transformés en ces adresses publiques que vous achetez par abonnement avec votre opérateur de télécoms généralement. OK ?

**[12:21]** Donc à apprendre, attention aux masques : 8, 12, 16. C'est pas 8, 16, 24 comme beaucoup croient. C'est 8, 12, 16.

**[12:35]** Donc vous avez un plan d'adressage privé que vous chopez là-dedans comme vous voulez, personne ne vous... vous faites ce que vous voulez, c'est votre vie. Et si vous achetez une adresse IP par location quand vous prenez un abonnement, et ben on va translater l'adresse source quand vous faites un paquet IP. L'adresse source, elle vient d'une de vos machines de ce plan-là, elle est translatée en celle-là quand ça sort. Et vous êtes vu par cette adresse IP par tous les routeurs Internet et par le destinataire qui lui va vous renvoyer ça et la box va ensuite faire le travail de dé-natage pour renvoyer à la bonne machine.

**[13:11]** Donc dans la box, il va falloir mettre de la mémoire, un petit peu comme la mémoire CAM de vos switchs Ethernet où un port est associé à une adresse MAC, eh ben là il va falloir mettre une mémoire dans la box là où on va avoir une liste d'adresses IP ici qui ont demandé des adresses IP là pour lesquelles on les a translatées et pouvoir les retrouver pour pouvoir amener les paquets retour. Et on va pour ça utiliser les ports TCP pour identifier chaque connexion vers Internet.

**[13:43]** Ça s'appelle la table de NAT que vous verrez la semaine prochaine parce que là vous la gérerez avec la commande iptables. Cette notion de masquer votre plan d'adressage par rapport au plan public, ça s'appelle masquerading et vous travaillerez avec la table NAT et vous ferez du masquerading la semaine prochaine. Et vous verrez cette table, vous pouvez la lire, vous pouvez la modifier en live si ça vous chante. OK pour tout le monde cet aspect-là ?

**[14:21]** Le subnetting, donc ça c'est quelque chose de connu, c'est plutôt de donner un /8, /16, /24, je donne un slash... je donne un nombre d'adresses à l'entreprise public là du coup juste qui correspond à ses besoins. Enfin juste, à la puissance de 2 près. Parce que c'est vrai que si j'ai besoin de 65 adresses IP publiques, eh ben il n'y a pas à chier, on m'en donnera 128. C'est soit 64 soit 128, les masques c'est des puissances de 2. Mais bon, c'est mieux que de filer 255.

**[14:58]** Quel est le masque pour un LAN qui n'a que deux adresses IP ? Voilà un LAN entre deux routeurs, toute l'architecture d'Internet elle est faite comme ça avec des routeurs qui ont des cartes en point-à-point (peer-to-peer), donc ça fait des micro-LANs avec deux adresses IP exploitées. Donc du coup, quel est le masque de réseau de ces LANs là ? /30 ! /30, c'était la question du quiz.

**[15:24]** Une adresse de réseau, deux adresses exploitables et une adresse de broadcast. Bon, vous êtes d'accord avec moi que c'est un peu con d'avoir une adresse de broadcast quand il n'y a que deux adresses sur le réseau. Broadcaster à l'autre, c'est comme faire de l'unicast, ça n'a pas de sens.

**[15:44]** Donc on va tordre un petit peu le cou à la règle de dire « On n'a pas le droit d'utiliser la première et la dernière » pour s'autoriser, pour ces petits réseaux là qui sont en fait gérés par les opérateurs (c'est pas vous qui les gérez, c'est les opérateurs, c'est leurs routeurs là), pour s'autoriser quoi ? Eh ben du /31 ! Qui fait qu'on enlève encore du gaspi.

**[16:09]** /31, il n'y a plus que deux adresses dans le plan d'adressage. Normalement, on ne peut pas en utiliser une seule parce que adresse de réseau, adresse de broadcast. Mais là si, on va se l'autoriser dans les routeurs, il n'y a que les routeurs qui sont autorisés à faire ça, ce qui permet de moins gaspiller les milliers, les millions d'adresses de réseau et de broadcast qui sont en /30. Et donc de multiplier par 2 le nombre de réseaux avec deux points sur Internet. Donc c'est une RFC récente où on casse un peu la règle de base pour enlever du gaspi encore une fois.

---

### [16:48 - 26:46] Fonctionnement du NAT44, Table de NAT et Risque de Saturation

> ⚠️ **[LIMITE DU NAT44] Saturation de table de NAT :**
> - Capacité maximale par IP publique : $2^{16} = 65\,536$ ports / sessions simultanées par protocole.
> - En cas de saturation (streaming, torrents, connexions multiples), tout nouveau paquet SYN reçoit un paquet `RST` (rejet).
> - **Remédiation :** Acheter un pool d'IP publiques chez l'opérateur ou filtrer/bloquer les flux récréatifs et le streaming.

**[16:48]** Le NAT comment il fonctionne ? Comme je vous l'ai dit, il y a une table, la voici, la table de masquerade ou table NAT, vous verrez `iptables -t nat` ce que vous ferez la semaine prochaine pour voir cette table. Et cette table se construit au fur et à mesure des connexions de votre LAN translatées en votre adresse publique. D'accord ?

**[17:08]** Et donc c'est très embêtant ce truc là. Alors c'est très bien parce que vous gaspillez une adresse publique pour 24, 65 000, 16 millions de machines privées. Très bien, bravo, vous avez fait de l'anti-gaspi. En revanche, lui, il taffe à mort quand même ! Parce que chaque fois qu'il y a des connexions sur Internet, une connexion SYN, SYN-ACK, ACK et les datas, reset, vous voyez les millions de paquets qui passent et qui sont représentatifs de connexions, connexions de sockets.

**[17:41]** Eh ben je vais prendre ces sockets et puis je vais devoir les gérer pour dire, pour savoir que si cette machine qui sort avec un port source va vers cette machine sur Internet (on est bien dans un plan privé, on va vers un plan public) et on va vers un port destination, je vais la translater. Donc je change rien à la destination, sinon ça merde, on est d'accord. Je vous rappelle, vous allez travailler avec cette table dans le pare-feu. Vous pouvez magouiller tout ce que vous voulez.

**[18:13]** Vous allez pouvoir magouiller tout ce que vous voulez ! Par exemple, une règle qui fait que dès que vous tapez 208.107.108.109, ça se transforme en ce que vous voulez. Avec un pare-feu, on fait ce qu'on veut dans une entreprise. On fait croire qu'on va sur Google alors qu'on n'est pas sur Google, vous faites ce que vous voulez. Le pare-feu, vous tenez par les couilles tous les protocoles réseau qui sortent et vous pouvez les magouiller comme bon vous semble. La preuve, c'est que vous pouvez déjà magouiller la table de masquerade.

**[18:43]** Et regardez qu'est-ce qui va identifier la communication : c'est le port de sortie. Le port de sortie va changer. Regardez : on a l'adresse IP source qui doit être translatée en adresse publique, c'est ce que je fais. Je prends le port source qui a été défini par l'application qui sort là (Firefox qui sort, il a tiré 27000 en port de sortie, c'est tiré aléatoirement), qui va faire du HTTPS a priori sur cette adresse là. Donc ça je ne le change pas. Mais ici, je vais tout changer, c'est-à-dire que je vais mettre l'adresse publique et c'est mon pare-feu qui définit et il fait +1 +1 +1 +1 +1.

**[19:24]** Et vous avez compris quelle est la limite de l'exercice : à un moment donné, en faisant +1 +1 +1 +1, j'arrive au max du nombre de ports possible qui est... $2^{16}$, donc... Répondez pas tous en même temps, j'entends... ça fait trop de bruit, j'ai plus de 65 536 ports possibles en TCP et en UDP. Donc 2 fois 65 000, mais il faut changer de protocole.

**[19:55]** Quand j'arrive à 65 000 là, ma table est pleine ! Si quelqu'un demande ici sur mon réseau une nouvelle connexion en sortie, je ne peux plus le translater ! Reset ! J'envoie un reset sur son SYN. Il va sur Google, il fait un TCP SYN et il reçoit un reset de ma box. Connexion... le navigateur : « Rien, connexion impossible, vérifiez votre réseau. »

**[20:24]** Alors vous pouvez dire : 65 000 sessions TCP c'est pas mal parce que ça bouge, ça vit. Dès que dans cette session là il y a le reset qui arrive ici et le reset qui fait ça là dans cette session TCP, dans cette socket, ça ça disparaît et je libère 8052. Donc ça bouge en permanence. La table de NAT, quand vous la regarderez, vous faites la même chose une microseconde suivante, elle est complètement différente. Ça bouge en fonction des sessions qui sont ouvertes, fermées, c'est un truc de débile.

**[20:56]** En UDP, chaque paquet c'est une entrée puisqu'il n'y a pas de session en UDP. En UDP, chaque paquet c'est une ligne. Une fois qu'il est passé, c'est terminé, il n'y a pas de retour de toute façon, on s'en fout. Donc les retours en TCP, les 65 000 entrées TCP en retour, c'est celles-là qui nous intéressent. Eh ben quand la table est pleine, ça dépend surtout du volume qu'il y a là, qui trafiquent (les mecs qui font du YouTube, du machin, du bidule). Bah ça se trouve il y a une machine qui va bouffer la moitié de la table NAT et toutes les autres qui rament comme c'est pas permis derrière pour avoir de la connexion quoi.

**[21:30]** Donc ça a une limite ce système. 1, c'est très gourmand pour la box parce que elle maintient à jour ce truc là en permanence et c'est dans la nanoseconde que la table est complètement différente. C'est du boulot et c'est d'ailleurs le seul truc qu'elle fait. Si elle est chaude, c'est que c'est ça qui l'a fait chauffer. Et qui fait ça ? C'est le pare-feu interne, c'est Netfilter qui fait ça. C'est ce que vous ferez la semaine prochaine.

**[21:54]** Donc oui il y a une limite : si j'ai trop de clients ici (alors c'est pas trop de clients parce qu'il y a des clients qui font rien), mais si j'ai trop de clients trop gourmands, eh ben je peux arriver à des connexions cassées, enfin c'est même pas qu'elles sont cassées, c'est qu'elles ne peuvent pas être initiées, la socket ne peut pas être posée.

**[22:12]** Solution ? Proposez-moi une solution technique à ça. Je suis sur un réseau, je viens d'engranger 10 salariés complémentaires en R&D, des développeurs qui... il leur faut tout Internet, ils vont être sur Git en permanence, ça va ouvrir des sessions permanentes partout. Ça lague, c'est le bordel, les connexions passent pas. Les admins réseau avant d'investiguer là-dedans, vous allez passer par un paquet de trucs différents hein ! Jusqu'au moment où ils découvrent qu'en effet en faisant du Wireshark on a pas mal de reset dans la gueule à l'initialisation de la connexion. Peut-être notre table NAT est saturée ? Ah bah oui, on a 100 salariés qui chacun font sur Internet. Donc quelles sont les solutions de remédiation ? Vous êtes le DSI là, il y a l'admin cyber qui est en stage de l'ESIA qui a détecté qu'il y avait la table des NAT qui était saturée, c'est pour ça qu'il y a des lags réseau et que ça merde. Qu'est-ce que vous proposez à votre DSI ?

**[23:42]** Alors, il y a la solution en effet, une solution on va dire très... peu restrictive on va dire, qui consiste à dire « Ben je vais acheter une autre adresse IP publique ». D'accord ? Et du coup, je vais avoir une double NAT. Donc je multiplie par 2. Le problème c'est qu'il faut que ça soit compatible. Et là vite, vous allez avoir des petits soucis. Déjà si vous êtes avec une box grand public, c'est mort. Il n'y a aucune box grand public où vous pouvez acheter une deuxième adresse IP. Donc là déjà, vous oubliez.

**[24:14]** Donc vous passez sur un opérateur de télécoms du coup. Un local hein, ici on a à Laval on va dire on a 6, 7 prestataires de services qui peuvent nous vendre des routeurs avec des adresses IP. Donc vous appelez les opérateurs locaux, vous demandez combien ça coûte, qu'est-ce qu'ils mettent comme routeur, est-ce que j'ai la main, j'ai pas la main (sachant que quand c'est une box vous avez la main de rien, vous pouvez que gagner la main sur quelque chose quand vous prenez un prestataire autre qu'un opérateur grand public).

**[24:43]** Et donc ben déjà peut-être que l'opérateur grand public, il a une option pro, ce que fait Free Pro maintenant, ce que fait Orange Pro. Et donc eux vont peut-être vous proposer ça. Forcément, il faut acheter une deuxième adresse, ça va coûter plus cher. Mais c'est une solution qui va plutôt dans le sens des utilisateurs où on ne veut pas trop les bloquer et on multiplie par 2 et peut-être que ça fera le taf. Très bien.

**[25:08]** Autre solution ? Quand vous êtes dans un pare-feu là... Bah vous filtrez ! Allez, on arrête YouTube, allez on arrête TikTok, allez on arrête... et voilà ! Et vous libérez des millions et des millions de sockets. C'est ce qui s'est passé à l'école pour deux raisons : ça et le fait qu'on ne veut pas encombrer le réseau avec des flux... On filtre, c'est tout ! Tout ce qui est très gourmand. Et ce qui est très gourmand, c'est l'audio, c'est la vidéo, parce que c'est des flux permanents.

**[25:49]** Et donc il faut l'écrire dans la politique de la DSI. Les salariés doivent être informés que l'on va filtrer pour telle ou telle raison. On ne va pas leur dire : on filtre parce que notre NAT 44 fonctionne mal. On leur dit : on filtre parce qu'on veut maintenir la bande passante pour le business. Et ça, personne ne peut contrer ça dans l'entreprise, vous allez aux prud'hommes vous perdez.

**[26:14]** C'est bon pour tout le monde ? Donc là on a naté une fois, OK ? Une fois. Ça s'appelle du NAT 44 : on passe de l'IPv4 vers l'IPv4, 4-4, deux fois IPv4. NAT 44. On natte une seule fois.

---

### [26:46 - 36:19] Carrier-Grade NAT (CGNAT / NAT444 selon RFC 6598) et impact sur le PAT

> 🎯 **[POINT EXAMEN / RFC 6598] Carrier-Grade NAT (CGNAT / 100.64.0.0/10) :**
> - **Plage :** `100.64.0.0/10` réservée aux opérateurs pour le double NAT (NAT444).
> - **Principe :** Une même IP publique est partagée entre plusieurs abonnés (ex: 4 abonnés ont chacun 16 384 ports).
> - **Impact majeur :** Impossibilité d'effectuer des redirections de ports standards (PAT 80, 443, 22) si l'abonné n'a pas la première tranche (1-1024). Obligation de demander une **IP full-stack / IP fixe**.
> - **4G/5G mobile :** Partage d'une IP publique jusqu'à 64 smartphones simultanés.

**[26:46]** Et donc on va... les opérateurs, ils ont bien compris, une adresse IPv4 ça coûte cher. Donc s'ils pouvaient vous faire payer une adresse IPv4 qui n'est pas complètement à vous, ça serait pas mal pour eux. Et donc ils vont nater deux fois : vous nattez une fois vous de votre côté, ils vont nater une autre fois de leur côté. Et ils ont tous été appeler l'IANA ensemble, ils ont dit : « Eh l'IANA ! Tu pourrais nous donner un petit réseau public a priori mais qui devient privé que pour les opérateurs ? » Et l'IANA leur a donné 100.64.0.0/10.

**[27:23]** Donc ce réseau-là, qui est un réseau public à la base, devient un réseau semi-public. Vous n'avez pas le droit... vous n'aurez jamais une adresse publique dans ce réseau-là, jamais jamais jamais. Pourquoi ? Parce que c'est les opérateurs qui l'ont acheté pour eux. C'est une particularité des réseaux publics.

**[27:46]** Et donc regardez ce qu'ils vont faire : ils vont faire du multiplexage de box en fait. Ils vont eux faire une première partie de NAT ici entre une adresse IP publique toujours pareil et les adresses IP de vos box. Par quartier ils font ça. Et puis l'autre quartier a la même adresse, le même plan : là il y a 254 box ici et puis un autre bloc de 254 box avec le même plan d'adressage en interne, routeur. Mais c'est cette adresse qui change. Vous voyez ?

**[28:20]** Ça c'est le quartier du Bourny et puis le quartier d'à côté, pour Free, la même chose pour SFR, la même chose pour Orange, chacun fait sa boutique. Eh ben c'est la même chose, il y a 254 box avec 91.160.153... mais avec ce même plan en inter-routeur box. Et donc vous, vous faites un NAT une fois pour partir dans cette adresse IP qui est là qui n'est pas publique vraiment, et ici ils refont un NAT vers l'adresse publique.

**[28:55]** Alors le problème, c'est : comment je vous retrouve ? Puisqu'avec la table de NAT, là ici je vous fournis 65 535 connexions simultanées. Mais comment je vais vous distinguer ici pour aller sur cette box et cette box ? Eh ben c'est là qu'il y a une astuce : on ici ce NAT là va découper le plan de NAT de 65 000 en N plans en fonction du nombre de clients que j'ai.

**[29:26]** Et du coup, le premier client là en l'occurrence, celui-là, eh ben les 65 000... les premiers ports sont pour lui, c'est-à-dire que la box ne peut pas sortir avec autre chose que 32 000 supérieur à 32 000 en port source et la box numéro 2 sera au-dessus de 32 000. Et donc le problème, c'est que vous n'avez plus 65 535 sessions simultanées, vous n'avez plus que 32 000 ! Cette box là, elle est bloquée à 32 000. Sa table de NAT dedans, on lui a dit : 32 000 mon garçon !

**[30:05]** OK ? Et donc vous êtes... C'est fini, vous n'avez plus les 65 000, donc soit vous bloquez ici, soit vous bloquez ici mais vous allez avoir des resets beaucoup plus nombreux par rapport au volume qui est là. Donc que font les opérateurs pour pas que vous vous rendiez compte de ça ? Ils vont faire ces magouilles dans les zones... ils ont fait des statistiques et ils ont regardé les zones dans lesquelles il y avait de la gourmandise en sessions TCP et dans lesquelles il n'y en avait pas.

**[30:33]** Un endroit où il y a déjà de la saturation dans les box sur les NAT... Je vous rappelle que les box ne sont pas à vous, vous ne possédez qu'un tiers de la box par location. Deux tiers du côté WAN ne vous appartiennent pas, par contrat, c'est marqué sur votre contrat. Et donc l'opérateur, il fait ce qu'il veut. Il regarde ce qui se passe. Il a la table des NAT, il peut faire des statistiques.

**[30:57]** Et donc ils peuvent vous dire : « Ben OK, vous vous êtes très très très gourmand parce que vous faites beaucoup de choses, eh ben je ne vais pas vous mettre dans une structure comme ça, je vais vous laisser avec votre système tout seul en NAT 44. » Ils font ce qu'ils veulent, c'est du Software Defined Network ça. Ils font tout seuls de chez eux. Le commutateur optique qui est là là, c'est un commutateur Ethernet sauf qu'ici c'est une fibre optique, c'est du SDN là ! Ils ont juste à faire clic clic clic clic et ça marche. Ils vous sortent de ce... ils vous mettent dans un autre...

**[31:31]** Et donc ils vous laissent en NAT 44 si vous êtes... Et notamment, ils vont vous sortir de ce système-là si vous demandez une adresse IP publique fixe. Faites-le ! C'est le bon moment de le faire parce que ça ne sera bientôt plus possible. En août de l'année prochaine, c'est fini, vous paierez 30 ou 40 balles l'adresse IP fixe. Faites-le maintenant ! Ceux qui l'auront fait avant pourront la garder.

**[31:57]** Alors chez Orange c'est déjà payant, c'est 20 balles. SFR ils vont disparaître donc je sais pas ce qu'ils vont faire. Mais Free, faites-le. Si vous le faites, ça veut dire que ça c'est raté ici, forcément, et ça bouge pas. Et ça bouge pas, tous les soirs on ne vous remet pas une adresse IP publique différente. Donc forcément vous êtes en NAT 44 et en plus vous ne changez pas d'adresse IP. Donc faites-le, comme ça vous avez vos 65 000 ports à vous. Tant que c'est gratuit.

**[32:28]** Donc voilà. Donc ça c'est fait en fait ça s'est fait naturellement sur vos téléphones portables. Regardez vos téléphones portables : à moins que vous ayez arrangé ça ce midi, tous ceux qui sont chez Bouygues, vous regardez votre adresse IP, vous avez tous la même. Publique. Ceux qui sont chez Free, regardez, vous avez tous la même. Donc vous êtes natés N fois.

**[32:51]** Et ça tombe bien, le téléphone c'est exactement le bon exemple parce qu'il est là le téléphone, et vous ne faites jamais 65 000 services dans votre téléphone, c'est juste pas possible de le faire, le téléphone il explose. Donc vous faites simultanément allez 15, 20 sockets ouvertes. Donc le téléphone est l'équipement adapté à faire à faire ça. Donc toute la téléphonie mobile, elle marche comme ça avec ici un seul téléphone et ben vous partagez votre adresse IP à 8, à 16, à 32.

**[33:23]** Celui qui est qui a été très fort c'est SFR, il est capable de partager une adresse à 64 téléphones. Mais ils font 64 téléphones. Et en fait vous avez $65\,535 / 64$ connexions possibles simultanées. Heureusement que c'est qu'un téléphone. Si vous commencez à faire du partage de compte en local avec votre téléphone et que vous mettez un PC ou deux, vous allez voir que vous allez ça va merder. Vous voulez vous connecter ça connecte, puis deux secondes après vous vous connectez ça connecte pas. Pourquoi ? Parce que votre téléphone il peut pas, il a je crois 8000 connexions simultanées possibles.

**[34:05]** Deuxième conséquence : celui qui est là là, il décide de faire du PAT parce qu'il veut exposer un serveur web. C'est une entreprise et puis ben ça y est ils ont un serveur web, donc ils veulent l'exposer là, ils veulent l'exposer en public port 443. Il l'expose port 443. Pas de bol mon pote ! Tu auras jamais 443 ici, ton adresse publique c'est bien celle-là, mais toi tes ports c'est 32000 à 65000.

**[34:36]** Donc 443, ça peut aller que sur celui-là ! Que sur celui-là. Toi tu veux faire du PAT pour exposer un serveur, tu peux pas. Tu es baisé. Donc il faut demander une adresse IP fixe, payer les 30 balles pour être certain d'être là, d'avoir directement votre adresse et tous les ports pour vous. Sinon vous ne pouvez pas récupérer les ports well-known. Rappelez-vous, les 1024 well-known ports sont en dessous par définition de 1024. Ça ce soir vous pouvez le vérifier tout de suite, donc la taille de la table elle diminue par définition.

**[35:16]** Et voilà. Voilà une une une facture Free. Allez voir chez vous ce soir. Et où on vous dit « Votre fibre optique, le NRO tout ça c'est le numéro du commutateur optique qui est là », et là vous avez votre adresse IP publique (je l'ai mise, vous voyez c'est la même) et derrière regardez : entre parenthèses, port 32000-48000. Qu'est-ce que ça veut dire ? Ça veut dire qu'on a fait du NAT 4 fois. On est partagé en... voilà c'est ça.

**[35:50]** Et j'ai que 1/4 des 65 000. Il y en a un qui a de 0 à 16 000, l'autre qui a de 16 000 à 32 000 et moi j'ai de 32 000 à 48 000 et le dernier a de 48 000 à 65 000. Donc moi je ne peux pas faire de PAT ici, c'est pas à moi ça. Voilà. Vous pouvez vérifier chez vous comment vous êtes.

**[36:19]** *[Fin du cours et de l'enregistrement]*


# Partie 4 — RADIUS, routage, ICMP, sockets, TCP, scan SYN et DNS (≈ 74 min)


**Fichier source :** `Nouvel enregistrement 4.m4a`  
**Durée :** 1 heure 13 minutes (73:51)  

---

### [00:00 - 09:06] Box Opérateurs, Authentification RADIUS, PAT et Pare-feu IPv4 vs IPv6

**[00:00]** Où je vous ai montré que donc on a troqué NAT IPv4 vers IPv4 44 ça a eu lieu ici avec 65 000 ports, mais que ces 65 000 ports sur un deuxième NAT sont segmentés en N clients, toujours une puissance de 2 bien sûr. Et donc oui vous avez 65 000 ports là, mais non ici vous risquez de n'avoir qu'une partie de ceux-ci.

**[00:30]** Donc le conseil : si vous voulez exposer des machines sur Internet, pour pouvoir disposer des well-known ports et plutôt se trouver sur cette Freebox, sur cette box là (SFR, Orange, ce que vous voulez, ou routeur que vous mettez vous-mêmes, je vous rappelle que vous pouvez tout à fait demander à votre opérateur de ne pas louer parce que vous louez cette box, et la loi française autorise tous les citoyens français à ne pas louer cette box, c'est grosso modo 1/3 de votre abonnement), mais si vous vous lancez dans cette aventure, je vous souhaite bon courage parce qu'ils vont tout faire pour vous dissuader de mettre en place donc ici un petit Raspberry avec une... faut quand même une carte optique hein, parce que la fibre vous ne pouvez pas la changer.

**[01:18]** Donc ou un petit PC ce que vous voulez. Bah ça va pas être simple ! Vous allez voir, vous allez passer de hotline en hotline en hotline, vous comprenez bien qu'ils ont tout fait pour vous dissuader de faire ce genre de chose. Tout simplement parce que ça sort de la normalité et que eux ils sont là pour traiter du volume et que celui qui veut faire autrement, il fait juste chier.

**[01:40]** Voilà, c'est de l'énergie. Ils ne peuvent pas nous l'interdire, mais il va vous falloir des paramètres pour vous connecter au NRO qui est là, le commutateur optique, c'est un commutateur Ethernet qu'avec des fibres optiques. Il n'y a rien qui change par rapport à un commutateur Ethernet normal. Mais il va falloir qu'ils vous filent des informations ici pour que votre fibre se connecte de l'autre côté, notamment un SLID et un SSI.

> 💡 **[AUTHENTIFICATION BOX FAI]** La box s'authentifie par adresse MAC et identifiants auprès du serveur **RADIUS** de l'opérateur pour obtenir son IP (DHCP), valider la ligne et appliquer le profil de débit (*Fair Use Policy*).

**[02:12]** Et ça, ils n'ont pas envie de vous le donner parce que ça vous donne des informations sur les box d'à côté. Enfin bref voilà, c'est un truc qui... Et puis il va falloir qu'ils vous donnent aussi un login/mot de passe parce que votre box, elle n'est pas juste pluggée sur le réseau comme ça et hop on a du réseau optique et ça marche, non c'est un peu plus compliqué que ça quand même.

**[02:38]** Il y a une authentification RADIUS qui va avoir lieu derrière. C'est-à-dire que la box, elle envoie son adresse MAC sur l'infrastructure de votre opérateur (Free, Orange, SFR) et elle va demander de récupérer une adresse IP par DHCP. Elle va demander : est-ce que cet utilisateur là, donc qui correspond à vous, il a payé son abonnement ou pas ?

**[03:02]** Est-ce que vous êtes dans le Fair Use que vous avez signé par contrat ? Je vous rappelle que par contrat, on vous dit que vous avez du gigabit et tout ça, mais on vous a jamais dit combien de volume vous avez droit. C'est pas illimité. C'est faux de le croire. C'est complètement normal qu'à la fin du mois vous trouviez que votre box elle rame. C'est que vous avez sûrement trop consommé.

**[03:28]** Et donc la box reçoit du serveur RADIUS des informations comme quoi on va limiter la bande passante parce que tu as déjà trop consommé mon garçon. Et donc en fin de mois, ben il y a tout un tas de personnes, les joueurs, ceux qui font énormément de vidéos et tout ça, qui se retrouvent avec, s'ils faisaient le test, avec moitié, quart, cinquième, sixième de la bande passante qu'ils avaient au début du mois. Parce que c'est faux de croire que tout le monde a open bar.

**[03:56]** Ceux qui ont open bar, c'est ceux qui payent. Donc les entreprises. Qui payent pour une prestation de service et un débit garanti. Vous, vous payez juste pour avoir une box et une accessibilité Internet, jamais à aucun moment on ne vous a garanti quoi que ce soit. Ni la permanence du service, ni le débit, ni la latence, ni rien du tout. Vous êtes un client grand public. OK ? Faut passer client pro pour avoir des exigences pour que vous puissiez exiger quelque chose. Mais c'est pas le même tarif.

**[04:28]** Voilà, on verra RADIUS hein, parce que ça fait partie de l'infrastructure de votre téléphone, c'est ce qu'ils font. Ils sont connectés, mais derrière il y a des connexions RADIUS pour savoir qu'est-ce que vous avez le droit de faire avec votre téléphone en ce moment. Est-ce qu'il faut pas vous couper la bande passante ? Est-ce qu'il faut pas juste vous couper ? Est-ce que les services de police n'ont pas demandé quelque chose aux opérateurs sur votre téléphone ? On ne sait pas. Tout ça c'est orchestré, c'est organisé, on va voir ça tranquillement ensemble.

> 🎯 **[POINT EXAMEN / DIFFÉRENCE IPv4 vs IPv6]**
> - **En IPv4 :** Le NAT protège les hôtes locaux par masquage, aucune connexion entrante non sollicitée n'arrive sur les machines.
> - **En IPv6 :** Toutes les machines ont une IP publique directe. Sans pare-feu de bordure actif, toutes les machines du réseau sont directement exposées aux scans et attaques externes.

**[04:55]** Bien, donc vous comprenez que si vous voulez faire du PAT, c'est-à-dire ça, faire une translation inverse, c'est que un port de cette adresse IP publique correspond à un port sur une des machines de votre réseau local. On fait de la redirection dans l'autre sens là, c'est des connexions initiées par Internet qu'on va laisser rentrer.

**[05:18]** Quand vous faites rien, il n'y a rien qui rentre dans votre réseau local, votre box est votre meilleur ami, c'est pour ça que personne ne veut les enlever, c'est pour ça qu'en France ça nous pose un problème IPv6 parce qu'il n'y a plus, c'est fini cette notion de port translation tout ça. En IPv6, il n'y a plus tout ça ! Il n'y a plus de protection.

**[05:37]** En IPv6, toutes vos machines, elles sont exposées sur Internet. Toutes vos adresses IP qui sont là sont exposées sur Internet. Il n'y a plus de protection. Et les opérateurs, ils ont dit : c'est pas de notre responsabilité de protéger les machines qui sont là, elles sont pas à nous.

**[05:54]** Pour l'instant, elles sont protégées grâce à IPv4 à cause de cette astuce de natage et de masquage d'adresses, et donc rien ne peut rentrer si vous ne faites pas du PAT, rien ne peut rentrer. La seule chose qui rentre, c'est ce que vous vous avez initié : vous avez fait un SYN, il y a bien des SYN-ACK, on a vu, c'est la table de NAT ça. Mais quelqu'un qui fait un SYN d'ici vers cette adresse là, il n'y a aucun port ouvert ! On ne peut rien faire. Vous n'existez pas en fait.

**[06:23]** Alors c'est pour ça que vous avez une option dans votre box pour savoir : est-ce que vous voulez quand même qu'elle réponde au ping ? Vous pouvez aller dans les options et dire : « Je ne réponds pas au ping. » Et vous êtes inexistant sur Internet. Si vous répondez au ping, vous êtes existant. Enfin l'adresse est existante. OK ?

**[06:41]** Mais du coup cette notion de NAT fait que ça vous protège vis-à-vis d'Internet, c'est le meilleur rempart à toutes les merdes qu'il y a sur Internet, c'est votre box. En basculant en IPv6, il n'y a plus ça. Ça veut dire que votre télé, elle est sur Internet, votre NAS il est sur Internet, votre montre elle est sur Internet. Direct ! Elle se fait scanner comme tout le monde.

**[07:07]** Donc actuellement en IPv4, si vous voulez autoriser un service à être exposé ici sur un port, eh ben il faut faire ce qu'il faut faire ici. Faut aller dans la configuration de votre box pour dire : « OK, tu exposes le port 11222 en public et ça sera redirigé vers la .5 en 22. » N'exposez pas 22 hein, n'exposez pas 122, n'exposez pas 2222, n'exposez pas 22222, parce que c'est ce qui est scanné en premier les accès SSH. Pour pouvoir faire du bruteforce, et puis il a tout son temps, le pirate il a toute la vie pour vous scanner, à un moment donné il va le trouver de toute façon.

**[07:50]** Voilà, mais l'opérateur ne veut pas prendre la responsabilité de ce qu'il met dans le pare-feu. Le problème, c'est qu'il faut expliquer à Madame Michu qui a 75 ans comment marche le pare-feu IPv6. C'est ce que vont faire les Français, et c'est ce que vont faire les Allemands. Et pour l'instant, on y va cool. Parce qu'il y a une notion de responsabilité. Quand vous vous ferez tout dépouiller ici, qui vous allez accuser ? L'opérateur de ne pas vous avoir protégé ou un attaquant qu'on ne trouvera jamais ? Donc c'est ça pose un petit souci réglementaire, c'est pas réglé complètement.

**[08:34]** OK, donc voilà pour le PAT, ça vous le savez très bien. Le problème c'est que si vous êtes naté, ben peut-être que vous n'avez pas accès à ces well-known ports donc vous pouvez... S'il faut pour un service web en 443, il faut dire à vos potes : « Ben non, tu ne mets pas 443, tu mets 22143 parce que j'ai pas le droit moi à la première tranche. » Voilà. Ou vous demandez une IP fixe et crac, et bim, du coup vous héritez de tout. C'est bon ? Pas de...

---

### [09:06 - 28:18] Tables de routage statique, métriques, route par défaut et messages ICMP

> 🎯 **[POINT EXAMEN / MESSAGES ICMP]**
> - **Destination Network Unreachable (Type 3, Code 0) :** Aucun chemin vers le réseau cible et absence de route par défaut (`0.0.0.0/0`).
> - **Destination Host Unreachable (Type 3, Code 1) :** Le dernier routeur a trouvé le réseau mais l'hôte ne répond pas aux requêtes ARP (machine éteinte/déconnectée).

**[09:06]** Je n'ai pas du tout envie de vous refaire les slides sur le routage et tout ça qu'on a faits l'année dernière, le routage dynamique. Vous reprenez les cours de 4ème année où je vous explique tout ça en long, en large, en travers. Je fais rapidement des exercices.

**[09:20]** Donc rappelez-vous les tables de routage qu'on trouve dans chaque... soit dans les box, dans les routeurs, qui permettent à un routeur de savoir ce qu'il a à faire quand il reçoit une adresse IP qui n'est pas dans un des plans d'adressage connecté directement. Il faut qu'il sache quoi faire : où est-ce que je l'envoie ? Sur quel autre routeur qui sera le relais pour... et puis qui lui-même sera le relais. Vous savez, on a inventé Internet comme ça.

**[09:48]** Donc voilà, donc là... Allez, répondez à ces questions-là. Ça c'est un truc que je peux vous donner vendredi. Je vous donne ça et puis je vous dis : « Allez-y, faites-moi un plan d'adressage LAN 1, LAN 2, définissez les adresses qui vont bien, comment vous faites pour que M3 puisse communiquer avec machin. » Voilà, et puis vous avez la feuille pour remplir et puis c'est parti. Pour faire de la sécurité réseau, il faut déjà savoir faire du réseau. Si ça déjà ça vous pose un problème, on est mal barré. Bon voilà.

**[10:24]** Ensuite, ça c'est pareil, c'est un truc que je peux vous demander. Je vous fais un schéma comme ça et puis ben vous répondez aux questions. Et dans les dernières questions, je vous dis : « Ben montrez-moi la table de routage... » Je vous en demanderai qu'une, je ne vais pas vous en demander deux, trois, quatre, ça ne sert à rien. Si vous avez compris pour une... Et ben donnez-moi la table de routage de R3.

**[10:43]** Tout ça c'est déjà renseigné, vous voyez ? Et vous devez déduire de ce que j'ai mis au tableau qui n'est pas complet. Par exemple, le LAN 1 2 3, combien d'adresses IP disponibles ? Donc LAN 1, vous cherchez, vous cherchez un masque, clac, OK, eh ben ça fait 65 535 - 2, hop c'est réglé. Ensuite, combien d'équipements maximum peuvent être connectés ? Ben vous répondez aux questions par rapport à ça. Peut-être qu'on va vous demander une adresse là, une adresse là, et ensuite un plan de routage. C'est bon ?

**[11:12]** Voilà, donc ça c'est vu l'année dernière. Je mets une correction. Au moins pour la table de routage, parce que ça, les premières questions c'est des questions basiques. Les tables de routage, je vous rappelle comment on fait une table de routage : donc là j'ai pris l'exemple de R3 qui est ici. R4 a priori c'est R4 qui va faire du natage. Et puis ben voilà, je vous explique R3 comment ça fonctionne.

**[11:37]** Je vous rappelle les réflexes à avoir si vous vous rappelez plus trop comment ça fonctionne : vous prenez le routeur pour lequel je vous demande une table de routage et la première chose à laquelle vous vous intéressez, c'est les premières lignes, c'est les lignes des réseaux sur lesquels il est connecté, ce routeur. Commencez par ça !

**[11:55]** Regardez, je prends R3 : il a deux réseaux connus qui sont qui sont connectés : ce réseau-là à deux machines et puis ce LAN là. Eh ben je renseigne tout de suite ces deux lignes-là. Il n'y a pas de métrique, c'est lui qui route donc il n'a pas besoin de passer par un autre routeur ou deux autres routeurs. D'accord ? Zéro métrique.

**[12:18]** Il les a appris par apprentissage local, c'est l'administrateur qui a mis les adresses IP là et là donc il n'a pas besoin d'apprendre ça par un protocole ou je ne sais pas quoi. Dès que vous lui mettez cette adresse-là, il sait qu'il est dans un réseau à 256 adresses IP et lui c'est le .2, enfin il n'a pas besoin de... pour vous renseigner le truc direct. Ça vous va ?

**[12:39]** Donc vous faites tout de suite ça : les deux LANs qui sont autour. Les deux qui sont autour ou les trois qui sont autour pour R1. Une fois que vous avez fait ces deux ces deux lignes-là, eh ben vous allez chercher les autres réseaux à partir de là. Donc vous prenez celui que vous voulez.

**[12:58]** Est-ce que le routeur là, il a besoin de savoir comment aller là au milieu ? Non. Il n'a pas besoin de savoir comment aller au milieu. Moi je l'ai quand même mise cette route. L'admin la met ou la met pas en fonction des besoins, mais il n'est pas obligé de la mettre parce que de toute façon ce routeur-là n'aura jamais à router au milieu là. Personne, à moins qu'un administrateur veuille faire un ping de cette adresse et de cette adresse, mais sinon il n'y a pas besoin. Des fois il y a des lignes qui sont présentes, elles sont on va dire non obligatoires. OK ?

**[13:33]** Ce réseau-là, est-ce qu'il a vraiment besoin d'être connu de ce routeur-là ? Non, sauf si un admin a envie de faire un ping de ça et de ça. C'est tout. Et c'est l'admin qui va le faire sa route s'il a besoin de faire un ping, mais sinon c'est pas utile. Donc dans les lignes qui suivent, c'est pour ça que celle-là elle est grisée, vous voyez ? Ça c'est pas obligatoire, c'est l'admin qui décide de la mettre ou pas. On est bien dans un réseau local d'entreprise.

**[14:02]** Et ensuite, les trois réseaux à atteindre c'est surtout celui-là, celui-là et puis Internet. Voilà les trois réseaux à atteindre quand je suis R3. Les utilisateurs qui sont là, ils ont envie d'aller là, ils ont envie d'aller là et ils ont envie d'aller sur Internet. Là c'est peut-être le data center de l'entreprise, là c'est peut-être une filiale à Bordeaux. Donc oui il y a des communications, mais après à la limite c'est l'admin qui dit : non, Bordeaux n'a pas besoin de communiquer avec Paris, Bordeaux communique avec un data center, Paris communique avec...

**[14:32]** Donc peut-être que dans la politique de sécurité de l'organisme, on dit que non, le siège social n'a pas à communiquer avec les machines qui sont là-dedans. Donc dans ce cas-là, la route vers LAN 1, celle-ci là, eh ben on ne la rentre pas dans le routeur. Et la sécurité, elle est faite comme ça ! Pas besoin de mettre des pare-feux, des merdes de je ne sais pas quoi. On enlève une route et pouf, personne ne peut y aller. Ça vous va ? On peut faire de la sécurité très simplement juste avec des notions de réseau de base de base.

**[15:03]** *[Étudiant]* : Je comprends pas pourquoi pour Internet on utilise 0.0.0.0.  
**[15:11]** *[Enseignant]* : Oui. Alors en fait, on va faire comme pour un pare-feu : un pare-feu, ça interdit tout. Donc quand vous allez voir avec Michael la semaine prochaine les règles du pare-feu, il n'y en a qu'une règle : de tout vers tout, interdit. Et c'est celle qui sera tout en bas. Et vous, vous allez rajouter des règles de permissivité en haut.

**[15:29]** Eh ben dans un routeur, c'est l'inverse : tout en bas, on met la route par défaut. C'est-à-dire si on ne sait pas aller là, là, là, là ou ailleurs, ou quand on veut aller ailleurs, je passe par lui. `0.0.0.0`, c'est une notation Cisco qui désigne tous les autres réseaux.

**[15:47]** Donc pour joindre ce réseau, pour joindre ce réseau, alors ce réseau avec ce masque (un réseau c'est un masque, on est d'accord), pour joindre ce réseau, passe par là. Pour joindre ce réseau, tel masque, passe par là. Ne faites pas des couillonnades : « passe par là », c'est forcément une de ses interfaces à lui qui connaît directement.

**[16:09]** Et ensuite pour aller partout ailleurs, tout ce qui n'est pas ça, ça, ça, ça ou ça, tout le reste passe par ça. Qui est qui est connu, qui est connu. C'est une notation Cisco. Vous pourriez y mettre "default", si vous écrivez "default", ça marche. Mais Cisco, il a décidé que l'adresse `0.0.0.0/0`, c'est toutes les autres tous les autres LANs.

**[16:48]** *[Étudiant]* : C'est à nous de le mettre ?  
**[16:51]** *[Enseignant]* : C'est à vous de le mettre. C'est une écriture, c'est comme ça qu'on l'écrit dans les règles de routage. Quand vous faites `route add default`, vous vous mettez "default", dans la table de routage c'est marqué `0.0.0.0`. Ça, ça s'appelle default, ou all. En BSD, c'est pas default, c'est all qu'on met dans la commande route.

**[17:18]** C'est pas une plage, regardez, c'est tous les réseaux. Ce qu'on a rendu routable, c'est `0.0.0.0/8`, différent. C'est une écriture ça. OK pour tout le monde ?

**[17:31]** Pas d'adresse IP publique : 172.16 c'est privé, 10/8 c'est privé, 192.168 c'est privé. Elles sont toutes privées ! Il n'y en a qu'une qui est publique, je l'ai pas là, elle est là. 10/8 c'est un des trois plans d'adresses privées. C'est bon ?

**[18:02]** Les noms des cartes, c'est forcément les cartes de ce routeur. Des fois, j'ai des étudiants qui me mettent des noms des cartes d'un autre routeur. Mais comment vous pouvez mettre ça ? Dans une table de routage d'un routeur, comment vous pouvez connaître le nom de la carte d'un autre routeur ? C'est pas possible ! Le routeur, il ne peut connaître que ses propres cartes. 10/8, 172.16, 192.168, les masques : /8, /12, /16. Les trois plans privés.

**[18:41]** Est-ce qu'il y a des questions là-dessus ? Donc faites-vous des essais, testez ça parce que ça vous l'aurez. Est-ce que vous avez vu que je peux faire de la sécurité là ? On me dit « Ah ben non, je ne veux pas que Bordeaux soit atteignable par le siège social », je n'ai pas besoin d'un pare-feu. On pourrait dire « Ah ben je mets un pare-feu. » Non ! J'enlève une route, et c'est fini. C'est fini !

**[19:02]** Si c'est pas moi qui ai les routeurs mais que j'ai un opérateur, ça ça peut être un opérateur ça. Vous avez appelé Alcatel-Lucent et vous achetez de la fibre optique de Bordeaux à Paris, un lien point-à-point avec un routeur dans lequel vous avez mis vos paquets, vous avez fait la sécurité de manière très simple. Tout 10.N c'est privé. C'est un /8. Le réseau 10 c'est un /8 qui est privé, c'est un réseau de classe A. Donc .1, .2, .12, ce que vous voulez, 10.quelque chose c'est privé. 172.16, il n'y a que ça de privé, c'est que cette partie-là qui est privée, et là pareil 192.168, c'est cette partie-là qui est privée.

**[20:15]** Donc on est bon pour ça ? Entraînez-vous. Aidez-vous. Oui ?  
**[20:23]** *[Étudiant]* : Si pour changer une route on enlève, est-ce que ça veut dire que s'il y a plusieurs routes qui mènent au même endroit...  
**[20:35]** *[Enseignant]* : C'est pas possible. Quand vous avez plusieurs routes, alors déjà c'est une action de l'administrateur de faire ça. S'il le fait à bon escient, c'est pour prévoir des routes pas de délestage mais des routes de failover. S'il y a une panne, il va passer par là. OK ?

**[20:53]** Mais là on est dans un système statique, c'est-à-dire c'est l'admin qui renseigne ça. On n'est pas dans un système dynamique où les tables de routage vont se passer entre routeurs de façon dynamique. C'est l'admin qui fait ça. Donc quand un admin il met deux routes pour aller au même endroit, c'est qu'il a prévu que en cas de panne de ce routeur on passe par un autre.

**[21:14]** Et donc il est obligé, je ne l'ai pas mis là parce que c'est particulier, il est obligé de mettre une notion de priorisation. Ce qui fait que parce que le routeur, il lit dans l'ordre. Comme le pare-feu, vous verrez le pare-feu il lit dans l'ordre. Et dès qu'il y a un truc qui matche, il n'y a pas de suite. Il fait ce qui matche et puis terminé, il passe au paquet suivant. C'est pour ça qu'il y a une notion de priorité, il faut que cette ligne-là soit toujours avant l'autre. OK ?

**[21:43]** Le routeur, il lit les lignes comme ça. Et dès qu'il y a un paquet qui arrive, il regarde la première : non. La deuxième : ah oui, l'adresse IP destination du paquet c'est ça, OK ben voilà, j'applique ça, donc je le route et terminé ! Il ne va pas lire la suite, on passe au paquet suivant. Le pare-feu, vous verrez c'est la même chose. Dès qu'il y a une ligne qui matche, elle est faite, même si en dessous il y a une autre qui matcherait aussi. Non, elle ne sera pas lue.

**[22:26]** S'il reçoit un paquet sur une interface et qu'il ne sait pas où aller, imaginons qu'il n'y ait pas ça (parce que là du coup il sait aller partout puisque par défaut il ira là), enlevons cette règle-là. Il reçoit... Allez, on fait ce scénario, il est pas mal. On a notre routeur R3 et je n'ai pas mis de route par défaut dans R3. J'enlève celle-là. Je vous rappelle, on est dans du routage statique, c'est l'administrateur qui rentre les routes. Ça s'apprend pas tout seul. Il y en a deux qui ont été apprises tout seul, c'est celles-là parce que c'est les deux pattes de mon routeur.

**[22:59]** Faites `ip r` de votre machine, vous allez avoir une table de routage (puisque tout Linux est un routeur) avec votre carte Wi-Fi et votre carte Ethernet qui sont connectées. Ça vous les avez, ça vous les rentrez à la main. Admettons que je n'ai pas rentré celle-là, je ne veux pas dans R3 mettre celle-là. Donc pour toute autre route, pour tout autre réseau destinataire que ceux-là (c'est pour ça que ça veut dire ça), passe par ça. Donc ça je l'enlève.

**[23:29]** Et imaginons que quelqu'un de Bordeaux se connecte et veuille se connecter à Google en 8.8.8.8. Ça vous va ? OK. Donc je considère que sur ces routeurs-là, il y a une route par défaut. C'est-à-dire que celui-là ben tu vas là, et celui-là tu vas là. Sauf que là, il n'y a pas de route par défaut.

**[23:49]** Donc 8.8.8.8, qu'est-ce que fait R1 ? Il regarde si c'est là : c'est pas là. Il regarde là : c'est pas là, c'est ces deux premières routes à lui. Donc il va sur sa route par défaut. Il envoie ça ici. Lui il regarde : c'est pas là, c'est pas là, il va chercher la route par défaut. Il arrive dans R3. R3 cherche 8.8.8.8 (il n'y a pas de masque, rien du tout, c'est l'adresse destination). 8.8.8.8 : non, non, non, non... ICMP, ICMP au destinataire (enfin à celui qui a émis) : Network Unreachable. Réseau non... je ne sais pas comment y aller.

**[24:32]** Autre scénario : je mets la route par défaut. Donc ça va sortir par là. Sur Internet, on a la même chose que ça, sauf que ces tables-là sont échangées entre routeurs dynamiquement. Tous les routeurs connaissent les routes des autres et font une synthèse avec l'algorithme de Dijkstra pour RIP. Bon. Donc c'est parti, on fait le scénario, regardez : sauf que je cherche 8.8.8.8. Donc je viens là, je viens là, lui il arrive là, il fait : « Ah, OK, 8.8.8.8 c'est pas ici, j'envoie ici. » Voilà.

**[25:12]** Là ça va sur le routeur de votre opérateur et c'est parti, il y a un routeur qui gère le réseau 8.8.8.8/24 quelque part sur la planète. C'est une entrée dans la table de routage dynamique. Et on connaît le nom du routeur qui gère ça. On y va, et on arrive là. Par exemple, la machine 8.8.8.8 du réseau 8.8.8.0/24 ne répond pas à l'ARP du routeur qui cherche son adresse MAC. Vous comprenez ça ? Je suis dans le switch du Wi-Fi et la machine... le routeur fait ARP pour trouver son adresse MAC, elle répond pas la machine. Qu'est-ce que fait le routeur ? ICMP à la source : Host Unreachable. Le réseau est trouvé, le routeur a trouvé son réseau, mais la machine répond pas. On était en Network Unreachable alors, on passe en Host Unreachable. Est-ce que ça vous va ?

**[26:18]** Écoutez maintenant le scénario suivant : je suis dans cette machine, je la configure et je ne mets pas de route par défaut dans la machine. J'ai pas reçu par DHCP, j'ai configuré mon adresse IP, j'ai pas de routeur par défaut. Je fais dans la machine `ping 8.8.8.8`, qu'est-ce qui se passe ? Je suis dans cette machine, j'ai configuré son adresse IP, j'ai pas mis de routeur par défaut qui est cette adresse-là. Je fais `ping 8.8.8.8`, qu'est-ce qui se passe dans votre OS ?

**[26:52]** Network Unreachable, et c'est votre OS qui vous le dit ! Votre OS vous dit : « Mais tu veux joindre un réseau qui n'est pas le mien, tu m'as pas mis de routeur par défaut, moi machine qui suis aussi un routeur... Non ! Donc c'est moi qui dis le message Network Unreachable. » Et puis il y a une main qui sort de l'écran qui fait : « Mets un routeur par défaut ! » C'est bon ?

**[27:14]** Donc ICMP sert à renseigner les machines que on n'arrive pas à joindre le réseau, qu'on n'arrive pas à joindre la machine, mais votre machine elle-même, si elle a une configuration qui ne correspond pas, est capable de vous dire la même chose sans faire d'ICMP.

**[27:32]** L'apprentissage ici s'est fait en mode statique, c'est-à-dire c'est l'administrateur qui a renseigné ça avec ses petites mimines via SSH sur les routeurs. Ou via du SDN, une belle interface où voilà. Si jamais on est sur un routeur d'Internet, vous vous imaginez bien que c'est pas les admins qui vont commencer à toucher aux milliers, aux millions de routes qu'il faut mettre. Donc c'est les routeurs qui se passent ces tables de routage, et donc c'est du routage dynamique. Et tous les routeurs ont tout, c'est ça le problème aujourd'hui, les routeurs ont toutes les routes, tous les LANs de la planète.

---

### [28:18 - 46:20] Définition d'une Socket, Handshake TCP 3-Way, SYN Stealth Scan et Path MTU/MSS

> 🎯 **[POINT EXAMEN / CYBERSÉCURITÉ] SYN Stealth Scan (Nmap -sS) :**
> - L'attaquant envoie un `SYN`, le serveur répond `SYN-ACK`. L'attaquant envoie immédiatement un `RST` au lieu du `ACK`.
> - **Pourquoi furtif ?** Les serveurs applicatifs (Apache, Nginx) ne journalisent (`log`) et ne créent de processus enfant (`fork()`) qu'**après réception du paquet ACK**. Aucun log n'est donc écrit dans les journaux applicatifs !

**[28:18]** Bien. Bon, on finit la partie rappels avec les sockets. On a fini, j'ai plus rien à vous dire avec TCP, IP, machin, c'est bon, on a fait le tour. Donc on monte dans les services : une socket, on a eu le cours ensemble sur les sockets, donc vous savez ce que c'est.

**[28:36]** Si je vous demande de définir une socket : port source, adresse source, port destination, adresse destination (IP destination) et protocole ! Protocole, ne me foutez pas du SSH, rien à foutre, c'est pas ça, c'est le port qui va définir le protocole applicatif. Protocole, c'est TCP ou UDP. Ces cinq paramètres-là, c'est ce qui constitue une socket. Une connexion identifiée entre un poste et un autre, d'accord ?

**[29:03]** Les pare-feux, cette socket ils vont les suivre, c'est-à-dire que quand vous allez faire un SYN, il va y avoir un SYN-ACK, ACK et puis derrière il va y avoir de la... Vous allez avoir un suivi de la session pour pouvoir la gérer avec un pare-feu, on appelle ça du suivi de connexion (conntrack, tracking de connexion). Donc vous verrez ça la semaine prochaine avec Michael.

**[29:24]** Bon ben voilà là c'est les sockets. Les ports, ils sont affectés par l'IANA, les well-known ports (80, 443, 22, machin, tout ça), mais si vous voulez changer ça vous faites comme vous voulez. Les ports utilisateurs, donc c'est ceux-là qui sont définis en port de sortie normalement. Quand votre navigateur web il sort, il faut bien qu'il ait un port de sortie, lui il va aller sur 443 en port destination, d'accord, mais mon port d'ouverture de sortie, ma socket en... Et donc il va tirer un nombre aléatoire là-dedans.

**[29:58]** Sous Linux et Android, c'est plus du tout 1024, c'est 32000. À partir de 32000 jusqu'à 65000. Ça change, de toute façon chaque OS fait un peu comme il veut. Bon vous pouvez aller voir ça, les well-known ports et tout ça, ça vous connaissez.

**[30:16]** Donc ce qui identifie une connexion, ce qu'on appelle une socket : adresse source, port source, adresse destination, port destination, n'oubliez pas le protocole ! Sinon il manque une info pour définir une socket. Et c'est ça que vous allez gérer dans le pare-feu, ce sont des sockets.

**[30:35]** Donc en sortie c'est éphémère, c'est le temps que la connexion se fasse, et sur le serveur ben c'est un port qui est toujours ouvert en attente de connexion des clients. Vous pouvez paramétrer donc ces ports éphémères de sortie là soit sous Linux avec une clé de registre, soit sous Linux directement avec un entier que vous allez définir dans `/proc/sys/net/ipv4/ip_local_port_range`. Si ça vous chante. C'est des choses qu'on peut faire dans l'entreprise des fois, on peut dire « Hop on va réduire, moi mes postes ils seront que comme ça. »

**[31:13]** Donc une socket, on l'a vu l'année dernière : SYN, ce sont des drapeaux. Les 10 drapeaux qu'il y a dans TCP, ces drapeaux s'appellent SYN, s'appellent ACK, s'appellent RST (que j'ai mis en rouge), s'appellent numéro de séquence. Donc on ouvre une session avec une poignée de main (handshaking) à trois étapes.

**[31:38]** C'est ça qui va être réduit en ce moment, on est en train de réduire cette séquence de "bonjour". Souvent on est juste en train de dire bonjour avec 0 échange de données, il n'y a pas de data, data = 0. Et on a déjà trois échanges avec un serveur, c'est un peu too much. On va réduire à deux parce qu'en fait dès que j'ai ça, c'est bon, ça me suffit. Pourquoi faire ça ? Donc ça c'est en train d'être supprimé, pour ça il faut que tous les OS soient d'accord, il faut que tous les pare-feux soient d'accord, il faut... Bref, tranquille ou tranquille.

**[32:12]** Une fois que vous êtes là sur ce serveur, c'est à ce moment-là, écoutez bien, que le serveur va logger, journaliser la connexion. Il n'y a rien qui dit qu'il y a de la connexion tant qu'on n'arrive pas là. Dès que j'ai reçu le bit ACK à 1 de ma séquence client, ici j'ai un log dans le log système, par le journal du noyau Linux. C'est ici que ça logge.

**[32:42]** C'est pour ça que quand on fera l'audit et contrôle avec moi ou avec JP, qu'on vous fera faire des scans de ports et que vous choisirez le scan de port de type SYN Stealth (donc furtif), l'idée c'est de scanner les ports d'une machine sans qu'elle logge. Vous, ce qui vous intéresse, c'est de savoir si ça a répondu ou pas. Donc vous envoyez jamais ça.

**[33:04]** Le problème c'est que ça vous ne pouvez pas le faire le demander à l'OS. L'OS ne sait pas faire ça et rien. L'OS quand vous demandez une ouverture de session par une socket par `connect()` en C système, l'OS a programmé cette séquence. Donc si vous voulez vous affranchir du retour pour pas que le serveur logge et donc pas qu'il s'aperçoive que vous êtes en train de faire un scan de port, pour faire juste SYN et attendre le SYN-ACK et rien faire derrière...

**[33:33]** Alors déjà c'est pas sympa pour le serveur parce que le serveur il a enregistré la demande de connexion et il est obligé d'attendre un time-out. Il y a un time-out là en attente et ça c'est en mémoire, c'est géré en mémoire. Donc vous pouvez faire déjà peut-être du SYN Stealth Starvation où vous allez le bourriner de SYN partout sans jamais faire de ACK. Et puis vous lui remplissez sa table de conntrack et il ne peut plus accepter de connexions. Ça fait partie des dénis de service. De lui envoyer que ça, plein de fois. Et puis jamais faire ça, ça fait qu'il est obligé d'attendre les time-outs.

**[34:16]** Ça se détecte tout ça. Et s'il n'y a pas de pare-feu devant avec des détecteurs d'intrusion, ben le serveur oui il répond plus, il est en train d'attendre des time-outs là et puis tant qu'il n'y a pas un time-out, il libère pas donc il ne peut pas accepter de nouvelles sessions. Ça vous va ?

**[34:31]** Donc un scan sans cette partie-là, ça s'appelle un SYN Stealth Scan, donc un scan furtif. Le problème c'est que vous emmerdez le serveur, bon le serveur vous vous en foutez, vous êtes pirate. Et surtout, ce que vous cherchez, c'est de ne pas logger parce que je vous ai dit que lui, dans son journal système, c'est ici qu'il va dire : telle adresse IP, tel port veut ouvrir une connexion sur... Ça vous va ? Grosso modo, voilà ce qui va se passer.

**[35:04]** Je suis sur le serveur. Le client fait son SYN, vous faites un SYN à la couche TCP. Le SYN, c'est la couche TCP du noyau qui gère ça. Le serveur Apache qui est en haut là, Apache qui est là qui attend, il sait même pas que quelqu'un est en train d'arriver. Il ne le sait pas, c'est trop tôt. TCP répond SYN-ACK. Le serveur Apache, toujours pas activé.

**[35:43]** Dès que là on reçoit le ACK de retour, il y a un log dans le log système comme quoi cette adresse IP, port source est en train de vouloir se connecter et c'est là qu'on fait un `fork()` d'Apache. Il est réveillé que à ce moment-là où le fils... Donc il fait un petit filiot, vous vous rappelez comment ça marche les forks, il fait un petit filiot qui vient choper cette socket et le père se remet en écoute. Et c'est le fils qui fait son taf et qui gère la connexion.

**[36:21]** Le père peut être réveillé une nanoseconde après pour avec un autre client qui vient faire... Et donc vous voyez qu'il y a une partie de la connexion c'est TCP qui s'en occupe, on va filer la prochaine au filiot que la prochaine demande qui est une demande de données généralement `GET /` donne-moi ta page de garde si c'est un site web HTTP. Ça vous va ? Voilà.

**[36:47]** Donc pour éviter les logs, ben vous vous pouvez scanner sans envoyer le dernier ACK là. Et du coup, le serveur ne loggera pas, personne ne sait que vous êtes en train de faire un scan de port. Sauf si vous ajoutez quelque chose qui va expressément chercher ce genre de scénario. Et ça s'appelle... C'est ici, c'est sur IP là, ça s'appelle le Firewall. Qu'on doit configurer pour essayer de détecter ce genre de conneries pour peut-être blacklister cette adresse IP source qui est en train d'essayer de faire un scan de port furtif. Mais sans firewall, le système ne sait pas : Windows ne sait pas, Android ne sait pas, Linux ne sait pas, BSD ne sait pas. Il faut rajouter quelque chose pour aller vérifier, c'est l'objet de la semaine prochaine. OK ? C'est bon ?

**[37:50]** Voilà, donc c'est qu'à ce moment-là qu'on logge et c'est qu'à ce moment-là qu'on réveille Apache par un fork que vous avez vu l'année dernière en programmation système. Alors ça peut être un fork ou ça peut être du multithreading, c'est la même chose. Vous vous rappelez, le dernier lab de l'année dernière c'était vous choisissiez entre fork et multithreading, chacun a ses avantages et ses inconvénients. Mais le résultat est le même, c'est qu'on réveille le serveur qu'à la fin de l'ouverture de la socket.

**[38:17]** Une fois que la socket... Alors bon je vous montre où sont dans l'en-tête TCP où sont les différentes informations TCP. Et une fois que c'est fait, eh ben c'est parti, on échange des données et on a un suivi de séquence, c'est-à-dire qu'au démarrage on a une séquence et on va augmenter le numéro de séquence du nombre d'octets que je vais envoyer. Ce qui fait qu'à chaque fois je suis certain... Par exemple lui, voyez, il acquitte 51, donc il acquitte 1 + 50, ce qui fait que la page sait que les 50 octets complets ont été reçus.

**[38:54]** On a un système d'acquittement qui fait pas dur de dire « J'ai reçu », mais « J'ai reçu tant d'octets ». Ce qui est assez efficace en fait et qui permet de dire : ben non, il me manque des octets, il me manque des trucs. Si ça n'acquitte pas, eh ben lui il va renvoyer la séquence qui manque. C'est plutôt assez élégant.

**[39:13]** Et quand c'est fini, on met le bit FIN à 1, c'est-à-dire le client n'a plus rien à faire, si le serveur dit qu'il acquitte le bit 1, eh ben fin de communication et la socket s'éteint et on rend les ports qui ont été ouverts au système. Le port éphémère que vous avez ouvert en sortie est rendu au système et peut être utilisé par un autre client de votre système d'exploitation. Pas de question là-dessus ?

> 🎯 **[POINT EXAMEN / FRAGMENTATION IP] Négociation du MSS (Maximum Segment Size) :**
> - Dans le paquet SYN, chaque hôte annonce son MSS ($MSS = MTU - 40\text{ octets} = 1460\text{ octets}$ en Ethernet).
> - On retient la plus petite valeur pour éviter la fragmentation IP le long de la route (indispensable pour les flux chiffrés VPN/TLS/SSH dont le découpage casse la signature d'intégrité).

**[39:42]** Quand vous faites un SYN sur un serveur, on va ajouter une information dans les en-têtes TCP (on est en TCP, on fait une session connectée), on va rajouter une information dedans pour savoir de combien il va falloir que je fasse les segments TCP de l'application au niveau applicatif. Quelle va être la taille des segments TCP entre ce serveur et ce client ? Et on sait pas.

**[40:16]** Vous, vous savez, vous êtes sur une carte Ethernet donc vous avez appris avec Monsieur Rey que c'était 1500. Je vous ai dit que si vous utilisez une liaison satellite de Musk, ça sera plutôt 500. Votre poste le sait, c'est sa carte réseau qui lui dit. Mais vous ne savez pas sur toute la chaîne jusqu'au bout si 1500 ça va passer.

**[40:36]** Imaginons que sur toute la chaîne il y ait un segment satellitaire à 500, vous vous allez faire des paquets à 1500, ça sort, ça va sur Internet, puis à un moment donné il y a un routeur qui dit « Oh ! 1500 moi je sais pas faire. Faut que je monte là-haut à 500. » Donc le routeur là va fragmenter. Il va casser le paquet en trois et il va faire trois paquets comme ça.

**[41:01]** Ça, ça marchera sauf que ça marchera pour des protocoles très simples, sauf pour les protocoles sécurisés où il y a de l'authenticité des paquets qui sont calculés : SSH, HTTPS, tous ces protocoles-là. Quand vous envoyez un paquet, vous calculez une empreinte que vous allez chiffrer avec une clé privée. Eh ben si ce paquet sur la ligne il est pété par un routeur qui dit « Cringe, je le coupe en trois », c'est juste que plus jamais ça ne marchera. Le contrôle d'intégrité marche pas.

**[41:34]** Les VPN fonctionnent comme ça. Quand vous montez un VPN, si jamais il y a des routeurs qui fragmentent au milieu, votre VPN ne montera jamais. Parce que le contrôle d'intégrité de départ, il est cassé dans la liaison. Donc vous vous devez, quand vous vous connectez à une machine avec ce type d'application sécurisée (VPN, SSH, TLS), de vous assurer que la connexion, la socket, va passer par un chemin où personne va fragmenter.

**[42:12]** Et donc pour vous assurer de cette non-fragmentation, il faut vous assurer que le chemin vous ayez récupéré le MTU, c'est-à-dire la taille du paquet maximum qui peut transiter dans les routeurs pour qu'aucun routeur vous casse en deux, en trois, en quatre, en cinq. Donc dans le SYN, vous allez envoyer l'information à l'autre de vous combien vous pouvez faire les paquets. Dire : « Moi c'est 1500. » Et l'autre va peut-être vous dire : « Ah bah moi ça sera 500. » Et il y a un routeur au milieu qui va peut-être dire : « Hop hop, 500. » Et donc ben vous allez vous tailler à 500 et vous ne faites pas... c'est pas vous qui le faites, c'est fait automatiquement par votre pile TCP/IP, ce qui fait que ça ne va pas fragmenter. On évite la fragmentation comme ça.

**[43:01]** Et donc c'est dans le MSS que vous envoyez ça, dans les... Alors ça c'est l'en-tête TCP : adresse source... port source, port destination, là on a les bits SYN, SYN-ACK qui sont là-dedans, et dans les options on va mettre une information qui est le MSS qu'on va négocier. Lui il va me rendre ça dans le SYN-ACK, il va me donner son MSS. Et hop, je prends le plus petit des deux. Ça vous va ? Voilà.

**[43:36]** Voilà, on a bientôt fini. Ça vous êtes capables de m'en parler, les couches du modèle OSI. Je vous rappelle que dans l'architecture TCP/IP, ça correspond à trois couches du modèle OSI. Bon, et puis vous avez les ports : en TCP en noir, en UDP en rouge.

**[44:00]** Ici regardez, il y a un... En terme de vocabulaire faites attention, ça peut être litigieux dans les entretiens : dans le vocabulaire réseau, la notion de protocole, elle est à ce niveau-là du modèle OSI. C'est 6 pour TCP, 17 pour UDP, et là pour les protocoles de routage dynamique. C'est là quand D'ailleurs dans le fichier `/etc/protocols` regardez sous Linux, vous allez trouver ça : que 17 c'est UDP, que 6 c'est TCP dans `/etc/protocols`.

**[44:31]** En terme de vocabulaire, quand on est très rigide sur le vocabulaire, on peut tomber sur des technos... Quand on vous parle : « Donnez-moi un protocole TCP », enfin si on vous dit « Donnez-moi un protocole TCP », vous savez qu'il parle de ce qu'il y a au-dessus. Mais si on vous dit : « Citez-moi des protocoles », là c'est ambigu. Est-ce que je lui cite ça ou est-ce que je lui cite ça ? Sachant que pour l'architecture, la notion de protocole c'est ça. Regardez dans votre `/etc/protocols` ou `C:\Windows\System32\drivers\etc\protocol`, vous allez trouver UDP, TCP, OSPF, VRRP, vous n'allez pas du tout trouver ces protocoles applicatifs.

**[45:12]** Donc voilà, ça peut être un peu litigieux. N'énervez pas non plus hein, parce que si vous commencez à dire « Oui bah TCP, UDP », il dit : « Mais non, c'est pas ça les protocoles, les protocoles je veux parler de HTTP. » Ne commencez pas à lui rentrer dedans en disant « Tu dis n'importe quoi, regarde dans `/etc/protocols`, ça a jamais parlé de HTTP. » Vous êtes en entretien d'embauche donc laissez un petit peu de souplesse dans la discussion. Dites-lui simplement que dans `/etc/protocols`, dans la norme architecture, c'est bien ça dont on parle, mais que dans sa tête c'est autre chose, mais de façon...

**[45:50]** Tout est considéré comme protocole. Il faut spécifier la couche du modèle OSI. Quand je dis « Donnez-moi des protocoles de la couche 2 », ça y est vous savez de quoi je parle. « Protocole réseau », c'est appliqué hein.

---

### [46:20 - 73:51] Architecture DNS, FQDN, Racine, TLD, Délégation et Résolveurs Récursifs vs Proxy

**[46:20]** On finit avec deux aspects : un aspect DNS et un aspect TLS. C'est Cyrielle qui va nous faire une petite... Ah non ? Prête ou pas Cyrielle ? Elle a fait une belle présentation de check-my-HTTPS. Et puis je lui ai même demandé de piquer ses slides parce qu'il y avait une façon... Elle a amené les choses d'une façon que moi j'avais pas... Je vais faire à sa place.

**[47:03]** Et ensuite, on pourra commencer le cours et vous donner le premier lab. Parce qu'il va falloir vous mettre au boulot.

**[48:40]** Donc on voit une partie DNS, mais je commence à vous parler de quelques particularités de sécu parce que le DNS OK vous savez comment il marche, on fait quelques rappels pour ceux qui ont zappé ça sur la plage. Mais comme pour les switchs, ben on voit comment on saute les VLANs pour les switchs, ben là on va voir comment on peut pétarder un peu le système DNS et du coup comment le protéger parce que c'est l'objectif, on ne le perd pas, vous n'êtes pas en lutte informatique offensive là, vous êtes plutôt en système défensif.

**[49:15]** Donc le DNS, rien de trop à dire, le but c'est de trouver l'adresse IP d'une machine dont l'homme peut se rappeler le nom. OK. Rien de particulier. Dans le vocabulaire, je vous rappelle qu'une machine par défaut, son nom d'hôte (hostname), c'est `localhost`, c'est RFC ça. Une machine qui n'est pas configurée, son nom s'appelle localhost. Et pareil, une machine fait partie d'un domaine, un domaine DNS c'est juste un ensemble de machines qui portent le même nom de domaine, c'est tout. Faut pas chercher plus loin que ça, il n'y a pas de notion technique là-dedans, c'est juste une notion de management.

**[49:57]** Et pareil, la RFC définit le nom de domaine par défaut : quand vous installez un OS (un Linux, un Windows), la machine s'appelle `localhost.localdomain`. Un Fully Qualified Domain Name (FQDN), c'est le fait de désigner un nom d'hôte et son nom de domaine. Très bien. On appelle ça donc un FQDN.

**[50:29]** Ça, c'est ce qu'on appelle une URL où on a le port destination que je cherche. Ça c'est le port destination. Pourquoi ? Parce que votre machine, qu'est-ce qu'elle fait quand elle voit ça ? Elle demande au fichier `/etc/services` (ou `Windows\System32\drivers\etc\services`) quel est le port de HTTP. Elle fait un map.

> ⚠️ **[PIÈGE / VULNÉRABILITÉ LOCALE] Fichier `/etc/services` :** L'OS s'appuie sur ce fichier pour convertir un protocole textuel (ex: `https`) en port numérique (ex: `443`). Si un attaquant local modifie ce fichier (ex: mapper HTTPS sur le port 80), il détourne les connexions sans que l'utilisateur ne s'en aperçoive.

**[50:53]** D'où une des premières vulnérabilités très simples : vous avez accès au PC d'un mec qui a oublié de se déloguer, et paf ! Via `etc/services`, vous allez dans 443 et au lieu de mettre HTTPS devant, vous mettez FTP. Ou vous faites HTTPS et vous mettez 80, le mec il pense qu'il part en 443, en fait il part en 80. Puisque le système s'appuie sur ce fichier-là pour faire la translation entre ce que vous marquez ici (le protocole applicatif réseau demandé) et le port destination qui va être mappé quand on va créer la socket. OK c'est bon ?

**[51:40]** Voilà. Et puis si vous voulez changer ce port par défaut qui est dans le fichier services, eh ben vous le spécifiez avec `:port`. Et là du coup là vous pouvez mettre... tout ça c'est ignoré par la création de socket, on va plutôt s'appuyer sur ça pour le port destination en ignorant le fichier services.

**[52:01]** Bien. Bon rien de rien de très particulier. Dans les notes, je vous explique comment sont encodés les caractères puisque il y a des attaques en homographes sur ce que le pire au lieu où vous pouvez appeler écrire ça en caractères chinois et vous avez l'impression que vous allez sur Gandi parce que c'est le lien qu'il y a dans le mail, alors qu'en fait c'est pas du tout écrit Gandi. C'est je ne sais pas quoi en chinois et c'est la même forme que Gandi.

**[52:33]** Les navigateurs sont tous intégrés, il n'y en a plus qu'un qui ne l'a pas fait, c'est Konqueror qui ne l'a pas fait (celui de KDE), mais tous les navigateurs maintenant checkent et ont des protections pour les attaques en homoglyphes. C'est pour ça que j'ai mis : regardez la protection, c'est mis en note. On s'en occupe un peu moins de cette attaque-là parce que elle a été usée, usitée et que c'était très chiant, il fallait rajouter des modules au navigateur pour s'assurer qu'on n'était pas en train de doubler. Donc maintenant c'est intégré au navigateur, il n'y a plus quasiment plus d'attaques comme ça qui fonctionnent, à part avec des vieux navigateurs qu'on voit passer. Ça faisait partie des techniques de phishing qui du coup ne marchent plus trop aujourd'hui.

**[53:27]** Pour récupérer votre nom de d'hôte, eh ben c'est `hostnamectl`. Maintenant, ça c'était l'ancien système qui va être deprecated, c'est ça qu'il faut utiliser maintenant, et c'est aussi avec cette commande là que vous allez pouvoir fixer un nom d'hôte. Si c'est un nom d'hôte c'est bien, sauf que ça marche que tant que la machine est allumée, dès que vous l'éteignez vous avez perdu le nom d'hôte. Donc il faut renseigner ce fichier-là pour que à chaque reboot votre machine reprenne un nom d'hôte que vous avez vous voulu fixer. Pareil pour Windows avec la base de registre.

**[54:08]** Vous avez donc un fichier `/etc/hosts` qui permet d'associer des adresses IP à des hôtes, que vous avez chacun sur votre machine. Le DNS vient surcharger cette cette résolution de nom pour avoir un système global. Ça c'est un système local pour trois machines, si ça vous chante c'est très bien.

**[54:33]** Dans les dans les dans les DMZ, il n'y a pas de DNS, je ne veux pas de DNS ou je ne sais pas quoi passer par des serveurs, il n'y a jamais aucun serveur qui fait des requêtes DNS, non ! On fait un fichier hosts sur chacun des serveurs et terminé, plus de requêtes DNS donc plus d'attaques DNS non plus ! OK ? Dans les DMZ, on ne fait pas de DNS. On fait du hosts. Les machines elles sont 5, OK bah c'est bon quoi, vous allez y arriver à 5.

**[54:57]** En fait, on enlève les services mondiaux quand on en a pas besoin. Par défaut on est flemmard donc on laisse tout, mais là c'est la porte ouverte à tout. Et si on commence à réduire la voilure, eh ben non, les failles disparaissent. Donc quand un quand un attaquant il arrive sur un serveur AD et qu'il essaye de joindre Google, bah ça marche pas ! Parce que votre AD, il a pas le DNS mondial. Mais par défaut, bah oui ça marchera. Et donc le pirate sera sur l'AD, ben il fera ce qu'il voudra, tant mieux pour lui, tant pis pour vous.

**[55:28]** Mais il y a des solutions ultra simples qui coûtent zéro et qui permettent de sécuriser les zones qui doivent être sécurisées, on ne fait pas ça partout. Mais dans une DMZ, moi je ne mets pas de DNS, je ne fais pas d'ARP. L'ARP est interdit, je fixe, je fais de l'ARP statique. Les machines, elles se connaissent en ARP statique. Le pirate, il peut essayer de faire tout le spoofing ARP ce qu'il veut, mais je rigole ! Puisqu'il n'y a plus de cache ARP si je fais de l'ARP statique. Il ne peut pas faire un Man-in-the-Middle de je ne sais pas quoi. Et ça va coûter quoi ? 2 minutes à remplir en ARP statique les 4 machines qui sont dans la DMZ.

**[56:11]** Voilà. Bon bref, quand le système local donc fonctionne très bien mais sur un système local très petit, et ensuite on passe sur le système global qui est le DNS. Pareil, le DNS comme je vous l'ai dit, c'est géré par l'IANA qui a un patron qui est l'ICANN et qui est sorti... L'ICANN est sortie du système associatif américain (association de droit américain) pour devenir une une entité de l'ONU. Parce que je vous rappelle que Trump voulait privatiser ce bordel et donc prendre la main sur Internet et tout faire payer avec ses valeurs à lui.

**[56:55]** Donc l'ICANN s'est fait hara-kiri pendant 10 jours où ils se sont dissous pour se recréer sous statut onusien pour pas qu'un pays puisse privatiser les adresses IP, les noms de domaine, etc., etc. Donc ça s'est passé en 2016, c'est pas si vieux que ça.

**[57:13]** Donc comment ça fonctionne ? Il y a un système hiérarchique qui s'appuie sur l'organisation de l'IANA. Rappelez-vous, les RIR, les LIR, bah c'est un petit peu la même chose, regardez : on a l'ICANN tout en haut et puis on va définir une hiérarchie et puis ça va nous permettre... Donc on appelle ça des registres et des registrars (c'est pas très beau en français). Et puis bah vous, vous allez acheter un nom de domaine ici.

**[57:40]** Donc vous, quand vous achetez un nom de domaine, soit vous l'achetez à votre prestataire de service Internet (les entreprises c'est ce qu'elles font, elles achètent ça à leur prestataire, nous ici on est sur notre prestataire c'est... j'ai perdu son nom, c'est ceux qui nous louent la fibre jusqu'à Paris, fibre noire, qui nous appartient). Donc c'est à lui qu'on achète les noms de domaine et c'est à lui qu'on achète les adresses IP privées publiques de l'école. Le plan d'adressage qu'on a acheté parce qu'on est opérateur télécom, c'est à part. Donc ensuite, bah lui il passe par un registrar qui passe par un registre, etc., etc.

**[58:26]** Le système DNS, il est simple. On a donc ce qu'on appelle les root servers qui gèrent un nom de domaine. Tous les root servers gèrent un seul nom de domaine, le nom de domaine s'appelle `.` (dot). C'est un nom de domaine, dot. Quand vous appelez un domaine, regardez ce que j'ai écrit à l'écran : vous appelez le nom de domaine `entreprise.com.`. Sauf qu'on ne vous oblige pas à le faire, votre OS va rajouter le point si vous l'avez oublié.

**[58:57]** Les gens pensent qu'il n'y a pas de point. Mais il y a un point parce que vous devez requêter la racine, le nom de domaine dot en premier. Donc si vous vous avez oublié là, eh ben c'est l'OS qui le rajoute dans la requête DNS. Regardez dans Wireshark, la requête DNS elle part avec un point.

**[59:15]** Et donc vous allez requêter la racine qui va regarder dans ses tables quel est le sous-domaine que vous avez demandé (entreprise, Google, je ne sais pas quoi, n'importe quoi on s'en fout). Et là, vous allez trouver trois catégories de sous-domaines qu'on appelle les Top-Level Domains (TLD). Trois catégories : la catégorie qui fait partie des country codes (FR, US, et en fait US il a disparu).

**[59:45]** Les Américains qui se considèrent comme les géniteurs d'Internet, ont dit : « Non mais US c'est par défaut, c'est nous. C'est nous les autres qui bénéficiez de notre technologie. Donc on va enlever US et quand on ne met pas de nom de domaine, par défaut c'est .us. » Ça n'existe pas US. C'est que si vous ne mettez pas de country code, si vous ne mettez pas un code là-dedans, ça sera .us qui sera rajouté par votre OS.

**[60:20]** Donc soit on trouve un country code, soit on trouve un TLD générique, soit on trouve maintenant depuis 10 ans des TLD liés au commerce. Tout ça ce sont des serveurs TLD. Ça fait 8 ans que l'IANA n'a pas demandé des nouveaux TLD, il l'a fait la dernière fois c'était il y a 8 ans, et il vient de le redemander cette année. Cette année, on va trouver 2000 nouveaux noms de TLD qui seront... ceux-là non c'est mort c'est réglé, mais qui vont se dispatcher là-dedans.

**[61:00]** Donc vous allez trouver des noms de marques de plus en plus derrière le TLD. Ça fait 8 ans que l'IANA n'a pas fait une ouverture de ces TLD. Donc là d'ici décembre, vous allez voir débouler des .esia, pourquoi pas. Ça vaut 50 000 balles un TLD. Et un gros dossier à faire pour justifier qu'on a besoin d'un TLD.

**[61:41]** Oui, c'est un contrat avec l'hébergeur. C'est dans le contrat avec l'hébergeur que vous allez définir qui est responsable de quoi. Et vous allez voir que l'hébergeur, il va faire en sorte qu'il soit responsable de pas grand-chose. C'est dans le contrat d'hébergement et ça se deale. En fait, c'est un service qu'il va vous proposer.

**[62:03]** Vous allez dire : « Moi je ne m'occupe pas de la sécu de mon site. » « Ah ouais mais moi je suis pas... » « OK, 30 dollars de plus par mois et je m'occupe de tout, je mets un détecteur d'intrusion machine, un détecteur d'intrusion réseau, le machin. » C'est commercial. Donc sous les TLD qui sont de trois catégories différentes (country codes, les génériques et les marques), on trouve les... Bah c'est ce que vous vous pouvez acheter en tant que petite entreprise, privée ou n'importe quoi.

**[62:35]** Vous allez donc acheter un nom de domaine là-dedans qui dépend qui dépend d'un gros. Et donc du coup bah vous allez chercher le moins cher. Les moins chers, c'est les .org, c'est les .fr, c'est les points comme ça qui sont les moins chers. Pour acheter ça, c'est 50 à 100 000 balles. Et ça, c'est juste pour avoir le nom. Après, il va falloir mettre des serveurs DNS partout sur la planète. Faut avoir une armée quand on va chercher un nom de domaine. On ne fait pas ça parce que un matin on se réveille : « Tiens, je vais m'acheter un TLD. » Voilà.

**[63:13]** OK, rien d'autre à dire. Lisez les notes pour voir comment ça fonctionne ça. Oui, donc en allant voir ce site `nic.tld`, vous allez avoir la liste officielle de tout ce qui existe aujourd'hui comme noms de domaine.

**[63:31]** Alors, c'est là que on vient... ce matin je vous ai mis une petite diapo en vous expliquant que sur le il y a l'Unicast, le Broadcast, le Multicast et puis on a l'Anycast. Eh ben c'est le DNS qui a demandé pour la première fois aux routeurs d'Internet de gérer cette notion de Anycast parce que on va trouver le même serveur DNS N fois sur la planète. Et ça commence par les serveurs racines.

**[64:00]** Les serveurs racines qui gèrent le nom de domaine dot (`.`), eh ben voilà, ils s'appellent... Eux ils sont là, ils sont tous là, ils s'appellent de A à M ces serveurs racines. Et on va les trouver N fois sur la planète. Je vous donne un exemple donc de la plaque parisienne. Donc c'est les serveurs racines plus les serveurs TLD. Les serveurs TLD, on va les trouver aussi N fois sur la planète.

**[64:24]** Eh ben voilà ! Alors vous ne saurez jamais où c'est. Je sais pas, vous saurez pas. Ça c'est le plus gros zoom qu'on puisse faire. Et à l'intérieur, ils sont bien planqués dans des blockhaus de l'ancienne commandante allemande, ils sont planqués dans des data centers à la... Pourquoi ? Parce que c'est un peu stratégique. Si on paume le L nous en France, le L c'est celui qui c'est aussi donc il gère dot, mais il gère .fr.

**[64:48]** Si vous pétez tous les L de la planète, plus personne ne peut se connecter à un serveur dans .fr. En terme commercial, ça peut poser quelques soucis quand même à certaines entreprises. Donc on a plutôt intérêt nous en France à multiplier les L. Donc là vous avez compris, il y a Bouygues, il y a Orange et il y a l'armée française. Dans la commandante, c'est l'armée française qui le gère. Au profit de l'ANSSI. Donc au profit du Premier ministre. Voilà. Bon rien à dire.

**[65:18]** Et comment vous, vous là ici quand vous faites un dig ou un nslookup (une requête DNS), sur quel serveur vous allez tomber ? Vous avez défini un nom de serveur, très bien. Alors c'est souvent le serveur de votre opérateur parce que il aimerait bien savoir ce que vous faites. Mais si vous décidez de mettre un serveur racine directement, pourquoi pas, parce que c'est comme ça que ça marche normalement : vous devriez aller directement sur la racine qui vous envoie sur le TLD, qui vous envoie sur le serveur de domaine et qui vous donne l'adresse IP.

**[65:50]** Le fonctionnement c'est ça : c'est vous demandez là, puis ensuite vous demandez là, puis ensuite vous demandez là et vous avez l'adresse IP. Clic clic clic. C'est un protocole qui se fait en trois fois. Eh ben si vous faites ça, quand vous allez demander racine, quel serveur on va vous donner ? Celui qui est le plus proche de vous. Et c'est là qu'il y a du Anycast qui se met en place pour savoir quel est le serveur DNS qui va vous répondre.

**[66:17]** Donc ceux qui gèrent le .fr, vous vous pouvez poser déposer un nom de domaine en .fr, vous avez le droit. Vous allez voir votre registrar (Gandi, je ne sais pas qui) et dit « Ben moi je vais m'acheter je vais m'appeler `rey.fr`. » Et là, il y a l'Afnic. Tous les pays ont un organisme comme ça (les Suisses, les Allemands et machins) qui gère le country code.

**[66:43]** Et qu'est-ce qu'ils gèrent ? Ils gèrent pas les noms de domaine, c'est votre registrar qui gère les noms de domaine. Non, ils vont valider ou pas votre nom de domaine. C'est-à-dire que si vous faites `fuckyou.fr`, ça risque d'être pas trop autorisé. Et c'est eux qui vont dire non. C'est pas le registrar. Le registrar, lui il prend votre argent et il pose le nom de domaine, il configure son serveur DNS et il a réglé son affaire et tous les mois il vous demande du pognon.

**[67:12]** Mais tous les pays ont un organisme, nous c'est l'Afnic, qui va faire un peu le tri pour pas faire n'importe quoi sur Internet. Quand vous déposerez un nom de domaine, eh ben ça prendra 3 jours : il y a 2 jours pour l'Afnic, 1 jour pour votre registrar. Le registrar n'a pas le droit de déposer un nom de domaine tant que en France pour un .fr... Si vous faites un .org, c'est pas l'Afnic, c'est directement l'IANA qui va le vérifier.

**[67:44]** Le fonctionnement normal, il est le suivant : vous êtes là, vous requêtez une racine, vous requêtez un top-level, vous requêtez un second-level. C'est le fonctionnement normal du DNS. Le problème, c'est que si ici j'ai 1 milliard de machines qui toutes vont requêter un root server, même si lui est multiplié 10 fois, on va saturer la racine.

**[68:10]** Donc on a demandé à tous les prestataires de service, ceux qui vous offrent les connectivités à Internet, de mettre des serveurs proxy et que dans votre requête DHCP que vous faites à votre box qui est ici, votre box vous dit : le serveur DNS, c'est lui. Vous avez compris le principe ? Votre box, de Free, quand vous faites une requête DHCP sur votre box, elle vous donne votre adresse IP, votre gateway et les adresses IP de votre DNS.

**[68:36]** Ces adresses IP là par défaut sont les adresses de proxy de vos prestataires pour pas que vous alliez emmerder les racines. Et comme toute la planète fait ça, ben les racines elles ont quasiment rien à faire. Parce qu'en fait vous requêtez un serveur proxy. L'avantage du serveur proxy, c'est que quand vous requêtez `esia.fr`, vous le faites, lui il regarde dans son cache : « J'ai pas `esia.fr`, donc je fais le boulot : .fr, ESIA, www, j'ai l'adresse IP, je réponds et je mets ça en cache. »

**[69:10]** Tous les utilisateurs de ce cache-là (donc de Free par exemple ou de SFR), dès qu'ils vont redemander ESIA, eh ben ça sera juste ça. Ils ne vont pas ré-emmerder parce que le cache est toujours valide. Les caches généralement ça dure 2 heures.

**[69:27]** Comment vous savez si vous avez tapé un serveur DNS ici ou si vous avez tapé un serveur relais ? Ben vous prenez Wireshark, vous regardez dans la réponse DNS du serveur (vous ne savez pas, vous ne savez pas si c'est lui ou si c'est lui) et si dans la réponse vous avez directement « Ce nom de domaine est à telle adresse IP », vous êtes en train de taper ça. Si dans la réponse vous avez "Non-authoritative answer" (réponse non autorisée) : « Tel serveur est à telle adresse IP », c'est un proxy qui vous a répondu.

**[70:00]** Vous savez si vous passez par un proxy. Pourquoi je vous demande de pourquoi de tester ça peut-être chez vous ? Parce que vous vous dites : « Oh ils me font chier, eux ils vont me faire des Lying DNS là, ils vont me mentir. Ils font ce qu'ils veulent ! Je veux aller sur Google, ils m'envoient sur un autre... » Ça arrive tout simple, ça s'appelle des Fake DNS. Donc j'ai envie, moi, d'aller dans un autre serveur DNS que celui-là. Je peux faire ça, OK ?

**[70:30]** Mais je peux aller sur un serveur DNS qu'on me dit safe qui appartient à l'Europe parce que l'Europe met en place des des serveurs DNS qui ne vous flicquent pas, qui voilà, c'est ce qu'ils disent, après c'est à vous de le croire ou pas. Et donc vous vous dites : « Allez OK, je configure ma machine, je ne veux plus passer là, je veux passer par le serveur DNS les deux serveurs DNS européens. Ou les serveurs de Cisco, ou les serveurs de Google (les 8.8.8.8, 8.8.4.4). » Ben voilà. Ben vous configurez. Très bien.

**[71:02]** Et vous testez. Et vous recevez la même réponse : "Non-authoritative answer". C'est qu'en fait votre prestataire, il a fait une règle de pare-feu, ça s'appelle une règle de redirection, où il prend vos requêtes DNS et il se les réapproprie ! Vous ne pouvez pas passer. Donc ils sont très rares en France à faire ça, ils sont tous en Chine à le faire, Alcatel fait ça pour pas qu'on puisse contourner les requêtes DNS et que vous soyez obligés de passer par un Lying DNS, donc un serveur qui est maîtrisé par l'opérateur, le pays, le roi, le je sais pas quoi, qui a décidé que son pays ça passerait par les DNS du pays et on répondrait ce qu'on veut.

**[71:56]** OK pour tout le monde ? Si vous voulez faire ça directement du top, votre OS ne va pas le faire naturellement. Il ne sait pas le faire naturellement. Il faut mettre un serveur DNS dans votre machine. Il faut mettre Unbound, il faut mettre DNSMasq et dire à DNSMasq : « Tu fais ce qui est prévu dans le protocole DNS. » Mais votre OS ne sait pas le faire.

**[72:26]** Donc voilà, DNS on est sur deux protocoles : UDP, TCP. Et un protocole applicatif qui s'appelle DNS. Mais on est sur les deux. Pourquoi les deux ? Le but du jeu c'est d'emmerder le moins les DNS sur Internet et quand le DNS il est local à mon réseau, bah ça pose pas de problème, je peux l'embêter un peu plus. Donc je vais faire du SYN, SYN-ACK, ACK quand c'est en local (TCP) et je vais faire une requête UDP (donc juste une requête qui part, il n'y a pas de SYN-ACK, il n'y a rien) quand c'est un serveur qui est à l'extérieur de mon réseau local.

**[73:06]** Et c'est votre OS qui le fait automatiquement. Dès qu'il voit qu'il fait une requête DNS à l'extérieur de votre réseau local : UDP. S'il le fait sur votre réseau local, ça veut dire que c'est votre propre serveur DNS dans votre infrastructure : TCP. Dans une entreprise, le serveur DNS c'est l'AD. C'est l'AD qui fait serveur DNS en local, souvent.

**[73:51]** *[Fin du cours et de l'enregistrement]*


# Partie 5 — DNS avancé, DNSSEC, TLS, CPCE et NAC / Alcasar (≈ 80 min)


**Fichier source :** `Nouvel enregistrement 5.m4a`  
**Durée :** 1 heure 19 minutes (79:33)  

---

### [00:00 - 11:06] Enregistrements DNS : A, CNAME, MX, SRV (LDAP/SIP) et TXT (SPF/DKIM/Version)

**[00:00]** Ça fait les deux. Pour un petit serveur... peu d'empreinte mémoire, assez réactif, c'est ce que vous avez, DNSMasq, dans toutes les box des opérateurs français. Je vous rappelle qu'au labo, sur la plateforme hardware, on a analysé les box sorties de deux opérateurs français : SFR et Orange. On a vu que sur ces deux-là, c'est DNSMasq.

**[00:26]** Voilà. Ça c'est le fichier de configuration d'un BIND qui permet de faire ça.

> 💡 **[ENREGISTREMENTS DNS CLÉS]**
> - **A / AAAA :** Résolution Nom d'hôte $\rightarrow$ IPv4 / IPv6.
> - **CNAME :** Alias vers un nom canonique.
> - **MX (Mail Exchange) :** Serveurs de messagerie avec priorité.
> - **SRV (Service Record) :** Localisation de services réseau (LDAP / Active Directory `_ldap._tcp`, VoIP SIP).
> - **TXT :** Données textuelles arbitraires (SPF, DKIM, DMARC, versions d'équipements).

**[00:39]** Stop ! Donc le serveur DNS, il a le nom de domaine dont il est autorité. Le terme c'est : je suis autorité sur. Donc il est autorité sur `domaine.com` et ensuite, à l'intérieur de ce nom de domaine, c'est lui qui va résoudre quand on va le solliciter. Il résout quoi ? Il résout des noms de serveurs (les hostnames) en des adresses IP. Donc `serveur.domaine.com.` normalement, eh ben voilà, il les résoudra, il sait faire.

**[01:15]** Il résout des noms canoniques, on prend des alias. Donc c'est une double résolution : quelqu'un qui chercherait à résoudre `wafwafwaf.domaine.com`, il fait une requête, le serveur de domaine regarde, cherche, trouve un Canonical Name (CNAME), voit que c'est `serveur1`, vient chercher `serveur1` et donc répond que c'est 10.0.1.5. On peut donner plusieurs noms à une seule machine dans votre serveur DNS.

**[01:44]** Dernière résolution possible : donc serveur, résolution d'adresse, résolution d'alias, résolution de messagerie. Les serveurs de messagerie, quand vous envoyez un message à l'ESTACA (`estaca.fr`), eh ben le serveur DNS qui gère `estaca.fr` a un champ MX qui va pointer le serveur de messagerie de l'ESTACA.

**[02:05]** Donc votre serveur de messagerie, au moment où il va sortir votre message, il regarde l'adresse destination `estaca.fr`, il fait une requête DNS au serveur de messagerie et il va chercher le champ MX (Mail Exchange) du serveur du serveur DNS de l'ESTACA qui va lui répondre `smtp.domaine.com`. Ensuite il va chercher à l'intérieur, il trouve que SMTP c'est un Canonical Name de `serveur2`, il remonte sur `serveur2` et il vous répond : envoie le message à 10.0.1.6.

**[02:35]** Tout nom de domaine normalement a un champ MX parce que qui dit nom de domaine dit messagerie, c'est quand même un peu lié. Donc vous devez cibler votre serveur de messagerie dans votre DNS.

**[02:49]** Dernière résolution possible, ça fait déjà trois (résolution de messagerie, résolution d'adresse, résolution d'alias), c'est la résolution de service. Si vous êtes curieux et que vous mettez un Wireshark au boot d'une machine Windows, très intéressant de savoir ce que fait une machine Windows au boot, vous allez vous apercevoir qu'il y a une requête toute bizarre qui est une requête de service, requête DNS de service où votre machine cherche à joindre son serveur Active Directory.

**[03:24]** Microsoft, c'est comme ça que ça fonctionne : ça fonctionne avec des clients et des AD. C'est comme ça qu'il a designé son système. Donc le problème c'est que l'AD il n'a pas son nom, il n'a pas son adresse IP, il n'a rien. Donc la machine Windows demande au DNS : comment s'appelle mon serveur Active Directory ?

**[03:44]** Et un serveur Active Directory c'est un... Alors ça ne sera pas SIP le protocole qui est demandé, là c'est un SIP. C'est quoi SIP comme protocole applicatif réseau ? C'est le protocole de signalisation de la VoIP. La VoIP, votre voix passe sur un port particulier, c'est pas SIP. SIP c'est le protocole qui va faire sonner le téléphone, qui vous met les messages, qui vous dit quand il y a quelqu'un qui a appelé et que vous étiez pas là, on appelle ça la signalisation.

**[04:26]** Eh ben là c'est un téléphone Voix sur IP qui ne sait pas où est son serveur SIP, il est dans l'entreprise, on lui a rien dit, donc il demande au DNS : comment s'appelle mon serveur SIP, du protocole SIP ? Et du coup, le serveur va lui dire : « Eh ben ton SIP serveur, enfin ton serveur SIP il s'appelle `sipserveur.domaine.com`. » Vous voyez, j'ai pas le nom de domaine de la machine, je veux juste... je cherche un service dans mon réseau local.

**[04:55]** Donc il va lui répondre ça, du coup votre téléphone va faire une deuxième requête en disant : « Ben donne-moi l'adresse IP maintenant de `sipserveur`. » « Eh ben OK, `sipserveur`, ah c'est un nom canonique. » Vous le saviez que c'est un nom canonique, dans la réponse DNS vous voyez que c'est Canonical Name. Vous savez que vous êtes en train de requêter un alias, qui n'est pas vraiment le nom de la machine. `serveur2`, puis `serveur2` vous donne l'adresse IP.

**[05:22]** Une machine Windows va requêter un service particulier de l'AD à chaque démarrage, c'est LDAP : `_ldap._tcp.votrenomdedomaine`. Et ici, vous avez le nom de l'AD. Ça tombe bien, c'est l'AD qui est serveur de DNS sur le réseau local de l'entreprise, donc il se connaît lui-même ! Mais une machine cliente, elle demande un nom de service, elle ne sait pas encore comment s'appelle l'AD. Donc elle dit : donne-moi le serveur LDAP (LDAP = l'annuaire qui est intégré dans l'Active Directory).

**[05:58]** Et c'est comme ça que Windows, dans un environnement full Windows, tout marche tout seul. Tout se boucle bien. OK ? Donc au moins quatre services de résolution : résolution de service, résolution d'alias, résolution d'adresse, résolution de serveur de messagerie.

**[06:24]** Un registrar, vous avez sûrement tous déjà vu ça peut-être. Donc là c'est Gandi. Donc vous achetez un nom de domaine, là j'ai pris par exemple `alcazar.net`. Donc voilà, ça coûte 10 balles par an, c'est pas non plus... Et donc vous pouvez... vous avez tout un tas de possibilités dont les enregistrements DNS parce que là du coup vous allez... vous modifiez les enregistrements DNS du serveur DNS de Gandi qui fait partie de l'infrastructure DNS globale.

**[07:08]** Donc dès que vous changez un enregistrement dans le nom de domaine que vous avez acheté, grosso modo dans les 10 secondes qui suivent, l'ensemble des DNS de la planète ont pris en compte. Ça s'appelle le temps de propagation. Si vous remodifiez cet enregistrement immédiatement, la planète sera informée dans 1 heure. Si vous remodifiez cet enregistrement au bout d'une heure, la planète sera au courant dans 24 heures. C'est un système pour éviter les modifications trop rapides sur les enregistrements DNS. OK ?

**[07:42]** Donc les enregistrements DNS, vous les avez là, et donc vous avez des enregistrements de type MX (donc c'est le serveur de messagerie de ce nom de domaine là), vous avez des enregistrements de type Canonical Name (FTP, FAQ, je ne sais pas, tout ce que vous voulez, DNSSEC, vous aurez un petit lab à faire ce soir là-dessus). Et des enregistrements de type TXT.

**[08:08]** Voilà un 6ème enregistrement qu'on n'a pas vu tout à l'heure, c'est un champ texte. Donc je requête le DNS, je lui dis « Que vaut acme-challenge.spectre ? » et il me répond « Ça vaut 100 ». En fait c'est des empreintes. Je peux mettre ce que je veux, je peux mettre... C'est un enregistrement texte : je demande le nom de l'enregistrement et il me renvoie une clé-valeur, clé-valeur. Vous pouvez mettre ce que vous voulez, vos applications peuvent s'appuyer là-dessus pour récupérer une info.

**[08:34]** Typiquement, regardez, j'ai un champ texte qui doit s'appeler `version` quelque part, c'est la dernière version d'Alcazar. C'est comme ça que mes clients Alcazar peuvent savoir qu'ils sont dans une version inférieure de la version finale. Alcazar fait une requête DNS, les Alcazar qui sont déployés sur la planète font une requête DNS de type texte qui s'appelle `version`. Et les serveurs DNS de la planète répondent `v3.1`. Et ça fait que l'Alcazar qui a vu ça, il dit « Ah, je suis en retard de deux versions », envoie une alerte sur l'interface d'administration.

**[09:05]** Et on ne peut pas me targuer, moi, de fliquer mes Alcazar parce qu'ils ne font que des requêtes DNS. Moi je ne sais pas ce qu'ils font, je n'ai pas un serveur chez moi qui les attend et qui fait faire une requête pour avoir le nom de version. Non, c'est une requête DNS. OK ?

**[09:20]** Donc voilà un dernier champ là qui permet... Vous changez ça comme vous voulez. La seule chose, c'est que vous ne pouvez pas changer un champ trois, quatre, cinq fois de suite à toute vitesse comme ça, il y a un système de blocage. Vous changez une fois celui-là, il va être propagé dans les 10 secondes sur toute la planète. Si je change ensuite celui-là, pareil, 10 secondes. Je re-change celui-là, paf, je passe à 1 heure. Et ensuite je passe à 24 heures. Donc quand vous le faites, ne vous trompez pas parce que vous savez que si vous vous trompez, la modification ce sera que dans 1 heure après.

**[10:14]** Ce TTL là, c'est pas pour vous. Ça c'est entre les serveurs entre eux. C'est combien de temps ils gardent en cache une résolution DNS avant de redemander à la racine. Ça c'est les serveurs de l'infrastructure, c'est pas vous tout en bas quand vous êtes en train de modifier. Ça c'est les TTL entre serveurs. Le vôtre, il est géré par votre registrar et en France c'est 10 secondes, 1 heure, 24 heures. C'est bon ?

---

### [11:06 - 21:08] Outils de diagnostic DNS (`dig`), DNS-over-HTTPS / TLS et OSINT WHOIS

**[11:06]** Practical exercises : donc vous pouvez faire des demandes de résolution directement à des serveurs DNS. Regardez, quand vous faites un `dig`, vous pouvez cibler le serveur DNS à qui vous voulez faire la requête. Si vous ne mettez rien, c'est votre serveur DNS qui a été configuré dans votre pile IP. Mais vous pouvez dire : requête 8.8.8.8 et demande-lui quelle est l'adresse IP de `alcazar.net`. Vous pouvez faire tout un tas de trucs. Donc `nslookup` risque de disparaître, il est toujours en place, il est toujours là, mais c'est `dig` qui prend la main.

**[11:43]** Vous pouvez faire des requêtes sympas : par exemple vous voulez connaître le nom du serveur DNS qui gère `esia.fr`. Quel est le serveur DNS qui gère `esia.fr` pour savoir si l'entreprise elle a son propre serveur DNS ou elle a tout filé à un hébergeur ? Je veux savoir, est-ce que l'ESIA a son propre DNS ? Pour savoir son adresse IP. C'est compliqué d'avoir l'adresse IP du serveur DNS de l'ESIA. Il n'est pas exposé, il est exposé en UDP. Donc vous le scannez comment ? Il ne répond pas au ping, il ne fait que de l'UDP sur le port 53. Donc il y a un serveur DNS derrière une adresse IP. Donc voilà, et après vous demandez les serveurs DNS.

**[12:33]** Donc le problème, c'est que lui il peut vous mentir. N'importe quel serveur DNS peut vous mentir. Et donc s'il vous ment, vous n'êtes pas sûrs du serveur DNS auquel vous faites des requêtes, qu'est-ce qu'il vous reste à faire ? Pas grand-chose. Payer à agir comme un serveur DNS pour que faire en sorte que vous-mêmes vous soyez serveur DNS et que vous alliez donc pouvoir requêter les racines. Et donc enlever lui et faire clic clic clic.

**[13:03]** Ça ça fonctionne si ici il n'y a pas eu un pare-feu qui vous oblige à taper dans celui-là. Si on vous oblige à celui-là, dès que vous faites des requêtes comme ça, vous aurez des réponses négatives de ce faux serveur DNS, il va vous bloquer : « Je ne peux pas sortir. » Ceux qui sont chez SFR, vous ne pouvez pas faire ça. La box SFR, elle bloque tout et elle envoie sur les serveurs DNS de SFR. Vous n'avez pas le choix. Le DNS, ça sera le serveur de SFR. Je ne sais pas pourquoi ils ont fait ça, mais ils ont fait ça. Les autres, vous pouvez tout à fait ne pas utiliser le serveur mandataire (proxy) de votre opérateur.

**[13:46]** Ensuite donc, bah oui vous changez de serveur mandataire et puis vous allez chercher des projets et là vous faites votre propre opinion. Il y a plein de systèmes qui proposent des services DNS en disant : « Nous on est plus safe, nous on ne trace rien. » Parce que mine de rien, le DNS ça dit votre vie en fait. Si on regarde vos requêtes DNS, on connaît tout de vous : on sait quand vous dormez, quand vous jouez, les sites qui vous intéressent, dans vos entreprises ce que vous faites, tout ce que vous faites on le sait, juste avec vos requêtes DNS. Donc ça peut être intéressant de s'y pencher un peu.

**[14:19]** Donc l'Europe a mis en place un système qui est pas mal, mais il y a d'autres systèmes. Alors après le problème c'est que dès qu'on arrive sur des DNS comme ça là qui appartiennent à des associations françaises un peu intégristes de la liberté, bah ils n'ont pas le pognon pour mettre des N serveurs DNS, donc ils en ont qu'un et parfois il y a un peu d'étranglement. Donc oui ça marche, mais vous vous apercevrez qu'à chaque fois c'est une demi-seconde pour avoir une résolution de nom, pas une seconde, ça se ressent.

> 💡 **[CHIFFREMENT DNS] DoT vs DoH :**
> - **DoT (DNS over TLS - Port TCP 853) :** Chiffre les requêtes DNS directement en TLS.
> - **DoH (DNS over HTTPS - Port TCP 443) :** Encapsule le DNS dans du trafic web HTTPS.
> - **En entreprise :** Les pare-feux bloquent facilement le port 853 ou blacklistent les résolveurs DoH publics pour maintenir le contrôle et la visibilité des flux.

**[14:52]** Et ensuite, vous avez envie de tout contourner parce que vous n'avez plus confiance en personne. Et donc vous dites : « Ben moi je veux chiffrer ma connexion vers un serveur DNS pour que personne n'écoute les requêtes que je fais. » Voilà. Alors après, est-ce que vous avez confiance au serveur DNS qui est derrière ? Là c'est pareil, peut-être vous vous trompez. Donc vous allez faire du chiffrement over TLS (DoT) ou over HTTPS (DoH). Vous allez encapsuler le DNS dans du HTTPS plus TLS ou directement sur TLS. Donc ce sont des serveurs qui écoutent sur Internet qui permettent de faire du DoH ou du DoT.

**[15:31]** Donc voilà les ports utilisés pour les RFC et les ports : 853 et 443. 1, faut avoir confiance au serveur qui est là. 2, comme ils sont peu nombreux, ils sont très facilement filtrables par un pare-feu qui est là parce qu'on les connaît, ils sont à peine une cinquantaine sur la planète. Donc on met les adresses IP en blacklist et c'est terminé, plus personne ne fait ni de DoH ni de DoT dans l'entreprise. Juste en blacklistant les adresses IP des serveurs DoH. Si vous avez la chance de connaître un serveur DoH que personne ne connaît, ça va pas durer longtemps. Parce que par définition ils sont publics ces trucs-là. Donc ils sont tous blacklistés, ne cherchez pas. Pour contourner le fait qu'on puisse vous tracer.

**[16:23]** Bien, alors je prends... Je ne mets pas en avant l'Europe, non, pas chez moi, mais voilà ce que propose l'Europe en terme de serveurs DNS : un serveur DNS 11.100 et 11.200 (ils sont toujours deux, s'il y en a un qui tombe en rade l'autre prend le relais), vous configurez les deux. Donc ça c'est sans filtre, il répond. Et puis ensuite vous avez les autres : donc en 1.201 ou 2.202, 1.213 ou 2.213. Et donc il y a de la protection pour les enfants.

**[17:01]** Donc pour les parents, c'est très intéressant ça. Parce qu'il suffit de mettre ce serveur là sur le poste du gamin, et terminé ! Dès que ça part sur des sites un peu à la one-again, eh ben non, ça sera redirigé sur une page générique avec un Donald Duck... Ah non, c'est pas ça ! C'est justement contre ça qu'on va se... Et pareil donc contre les trucs de pub, alors les enfants plus la pub, enfin voilà, ils ont fait un truc... à tester. Mais au moins c'est géré quand même par des gens qu'on connaît, c'est au moins cet avantage-là.

**[17:47]** Donc les serveurs DNS, le problème c'est qu'il faut les mettre partout. Pourquoi ? Parce que sinon ça fait un goulot d'étranglement et l'idée c'est que vous puissiez être requêter le serveur qui est le plus proche de vous en terme de bond réseau (de hop, un hop c'est un passage d'un routeur). Donc vous, vous faites une requête à un prestataire (votre prestataire Free, Orange, machin) ou un prestataire qu'on appelle un CDN. Donc le CDN, ce sont des prestataires sur Internet qui sont là pour dupliquer les serveurs partout, un peu partout.

**[18:23]** Si votre entreprise commence à travailler avec des CDN, ça veut dire que ça fonctionne bien, c'est qu'ils ont un site web qui n'en peut plus d'être tout seul, donc il faut le dupliquer, faut en mettre un deuxième en Asie, un troisième aux États-Unis, un quatrième... Et donc on passe par ces entreprises-là et c'est elles qui vont gérer la duplication. Donc du coup, qu'est-ce qu'elles font ? Elles prennent le serveur original (alors il peut rester chez vous, c'est pas parce que on le prend mais elle le considère), elles vont le synchroniser avec les serveurs que vous avez payés là qui vont positionner sur les plaques qui vous intéressent et c'est via rsync qu'on va synchroniser les services (ça peut être du web, ça peut être du DNS, ça peut être ce que vous voulez, enfin tout).

**[19:05]** Tout synchronisé, c'est eux qui s'occupent de ça. Et ils vous mettent les serveurs qu'on appelle des surrogate servers, donc des serveurs miroirs déplacés sur la planète, et ils les synchronisent, c'est leur boulot. Vous le vôtre, il est là ou il est chez vous. Et ensuite, ils vont jouer avec leur DNS pour orienter les gens au bon endroit avec les critères de votre choix : ça peut être un critère géographique ou ça peut être un critère de charge. Quand ce serveur-là il est trop gonflé, eh ben le DNS va vous envoyer sur celui-là. Et le DNS va orienter comme ça sur le serveur le moins chargé, le plus proche, ce que vous voulez. Et c'est eux qui gèrent tout. Vous, vous faites un chèque à la fin du mois et c'est bon. Donc c'est des gros qui font ça. C'est ceux qui ont des infrastructures, des data centers qui peuvent dupliquer les VM, savent faire du rsync entre leurs data centers avec des tunnels VPN qui relient leurs data centers et ils ont toutes les synchronisations qui se font dans ces tunnels. C'est des pros quoi. Ça coûte un petit billet, mais voilà.

**[20:12]** Si vous êtes développeur, vous pouvez faire des tests de développement à partir de noms de domaine que vous n'avez pas encore déposés. C'est plutôt avec les SW qu'on parle de ça, mais vous faites du développement et vous savez que vous développez pour une entreprise qui va s'appeler `mabaguette.fr`. Mais le nom de domaine n'est pas déposé. Or vous devez tester en local vos services, vos serveurs web et tout ça. Donc il y a des solutions : c'est que vous pouvez directement requêter... Vous mettez ces serveurs DNS là et ils vous répondent vous-même ! Vous pouvez leur demander n'importe quoi, ils vous répondent votre propre adresse IP. Ça permet de faire des tests de dev alors que le nom de domaine n'existe pas, alors qu'il va être peut-être inscrit en dur dans votre code ou je ne sais pas quoi. Et donc c'est pas mal pour les devs, ça permet de faire des tests alors que le nom de domaine n'est pas encore actif.

---

### [21:08 - 37:32] Vulnérabilités & Attaques DNS (DNSSEC, Cache Poisoning, Tunneling Iodine, Homoglyphes)

> 🎯 **[POINT EXAMEN / ATTAQUES DNS]**
> - **Amplification DNS :** Requête UDP courte (60 o) avec IP source spoofée $\rightarrow$ réponse volumineuse (3000 o) vers la victime.
> - **DNS Cache Poisoning :** Injection de fausses résolutions dans le cache du résolveur pendant la phase de résolution (parade : **DNSSEC**).
> - **Tunneling DNS (Iodine) :** Exfiltration et encapsulation d'un tunnel IP complet dans les champs optionnels TXT/NULL des requêtes DNS (port 53).
> - **Attaque par Homoglyphes :** Utilisation de caractères cyrilliques/étrangers imitant l'alphabet latin (parade : encodage Punycode `xn--...` dans les navigateurs).

**[21:08]** Bien, on va faire un peu de sécu quand même maintenant. Donc première chose en sécurité : l'OSINT. Les registres ont l'obligation de publier les informations administratives des noms de domaine : qui a acheté le nom de domaine, avec quel argent, où est-ce qu'il habite, quel est son numéro de téléphone. C'est très embêtant ! Parce que ça peut dévoiler plein de choses et puis vous n'avez pas forcément envie de voir votre numéro de téléphone directement dans les bases de données DNS qu'on appelle les bases WHOIS.

**[21:42]** La base WHOIS : `whois` est une commande, vous faites directement `whois nomdedomaine` et ça vous répond toute la base administrative du WHOIS. C'est plein de champs, c'est du XML, c'est formaté. Vous avez le technicien, l'administrateur, le patron de la boîte, les numéros de téléphone, il y a plein de trucs. Les registres sont obligés d'avoir ça. Donc ce qu'on a imposé, c'est que le registrar ait l'autorisation de cacher les informations. Le registrar c'est celui qui est très proche de vous, le registre c'est au-dessus.

**[22:12]** Et donc les lois nationales peuvent bloquer la sortie d'informations. C'est le cas en France, pas le cas en Suisse, mais c'est le cas en France. Si vous requêtez en WHOIS les registrars français (Gandi et autres), eh ben ils vont pouvoir, si vous le souhaitez (c'est quand vous vous inscrivez pour acheter un nom de domaine, vous dites : « Je veux anonymiser les informations »), eh ben faites un WHOIS sur `alcazar.net`, vous ne trouverez pas. Vous trouverez : « Information cachée, information cachée ». En revanche, le registre qui ne publie pas lui, c'est le registrar qui publie, il l'a l'info. Un État peut lui demander les infos, il doit les lui donner. Mais elles ne sont pas publiques pour l'OSINT.

**[22:56]** Alors, les attaques sur le DNS, elles sont diverses et nombreuses. La première, la plus simple : donc déni de service, parce que le DNS ça reste quelque chose de très open. Donc ben j'utilise mes bots, mes 15 000 bots que j'ai un peu sur la planète et je leur demande à tous en même temps de faire une requête DNS sur `esia.fr`, autant vous dire que notre serveur il ne va pas durer bien longtemps. C'est un CentOS là qui est à bout de souffle. Donc je dis 15 000, mais à mon avis je fais 3 000 simultanés, il s'écroule. C'est pas qu'il s'écroule, c'est qu'il ne répond plus. Bon, ça existe. Ça peut être bloquant, nous à l'ESIA on s'en branle, mais une entreprise commerciale qui vend pour un million de matériel toutes les minutes, c'est très embêtant que son nom de domaine soit bloqué quoi. D'où les CDN, la duplication partout pour empêcher le déni de service. Parce que ça c'est très simple à faire, ça a lieu tous les jours pour bloquer des DNS qui ne sont pas protégés en se multipliant.

**[24:06]** On a des attaques par amplification : là c'est l'avantage c'est qu'on va on va embêter à la fois le DNS et une victime, c'est-à-dire pourquoi pas votre voisin de l'appartement du dessus. Qu'est-ce que vous faites ? Vous faites une requête DNS en UDP sur Internet sur un serveur DNS (soit en déni de service), mais l'adresse source vous la modifiez, votre adresse source vous mettez l'adresse source de quelqu'un d'autre. Vous faites une requête en 60 octets (c'est la... ça fait à peu près ça une requête DNS en UDP, 60 octets), la réponse elle fait 3 000 ! Donc vous faites 10 000 requêtes de 60, bah rapidement lui il est en déni de service et lui aussi ! Parce que le serveur DNS répond à l'adresse IP source qui n'est pas la vôtre, c'est celle que vous avez mise à la place en faisant du spoofing IP. Donc vous pouvez comme ça saturer les réseaux assez assez rapidement. Ça s'appelle des requêtes par amplification. C'est bête et con, mais ça peut dégommer.

**[25:13]** L'empoisonnement de cache, c'est beaucoup plus embêtant parce que ça ça fonctionne encore. Surtout sur les sur les DNS des entreprises. Très peu sur Internet, de moins en moins, mais les entreprises hébergées par les entreprises (notamment le nôtre, celui de toutes les entreprises quasiment), il y a un temps de... comme le cache ARP. Vous vous rappelez le cache ARP qui peut se modifier ? Vous avez modifié le cache directement sur la machine, eh ben là vous allez modifier le cache du DNS, tout à fait possible. Et donc lui, il fait une requête DNS. Ce serveur-là ou ce proxy-là n'a pas la réponse. Donc il va demander, il va faire : racine, machin, bidule, truc.

**[25:58]** Pendant à ce moment-là, vous, vous lui envoyez des réponses DNS en disant : « Ah mais tel domaine c'est telle IP. » Il le met dans son cache, il répond, et l'autre bah lui au lieu d'aller sur le bon serveur, il va sur votre serveur. Le cache DNS est usurpable rapidement pendant le fait que ici le cache est ouvert parce qu'il est en train de le renseigner.

**[26:25]** Comment... Alors il y a eu plein d'attaques qui ont eu lieu là-dessus et ça fout un sacré bordel. Donc comment comment comment maintenant vous mitigerez ce système-là ? Regardez, je répète : on a l'utilisateur, ici on a un proxy DNS ou un DNS, il n'a pas la réponse, il fait donc une... S'il a la réponse, il répond directement, fin de l'histoire. Il n'a pas la réponse, donc il requête le serveur et à ce moment-là son cache est disponible. Vous injectez en UDP DNS (c'est du paquet forgé avec Scapy), vous faites une requête DNS de réponse. Vous vous faites passer pour lui en fait. Vous lui répondez et puis bah lui il va il va répondre une adresse IP qui n'est pas la bonne et puis voilà.

**[27:15]** Où est le problème ? Pas tant le chiffrement, parce que là j'écoute rien. Autre chose : authenticité. Il n'a pas checké que lui, il est connu et lui il n'est pas connu. Il est open bar. Le problème c'est que dans le DNS, il n'y a rien qui authentifie un serveur. Il n'y a rien. C'est des serveurs, c'est des adresses IP, machin. Donc il faut rajouter quelque chose. On n'a pas ça, le DNS n'avait pas prévu ça. Comme toute la sécurité réseau, rien n'avait été prévu à la base, on est en 1980 quand tout ça ça a été inventé.

**[27:56]** Donc voilà, c'est ça qui manque. Ce qu'on n'a pas, c'est que lui là, il ne sait pas que une réponse DNS d'où elle arrive, elle est bonne. Bah non, elle est pas bonne ! Elle doit arriver d'un serveur dont tu as la confiance. Donc tu dois... Aujourd'hui en 2026, on a des systèmes maintenant pour authentifier les gens, ça s'appelle des certificats. Du TLS. Mais à l'époque, il n'y avait pas tout ça. Donc eh ben le DNS, il acceptait des réponses parce qu'il a fait la requête, il attend la réponse et vous vous répondez avant lui. Il n'a pas vu que vous vous êtes un pingouin.

**[28:40]** Donc aujourd'hui, il faut mettre en place... et donc c'est ce qui se met en place sur Internet, pas dans les serveurs DNS d'entreprise (très peu), ce qu'on appelle DNSSEC qui va permettre à ce serveur-là de dire : « Tu n'accepteras les réponses que des serveurs qui ont les certificats qui vont bien. » Via la PKI suivante, nanana et voilà, et on est dans un système TLS standard. Ça s'appelle DNSSEC où lui sait qu'il doit recevoir la réponse qui est certifiée. On met un système de certificat sur sur les serveurs qui sont autorité. Et donc lui il peut toujours essayer, il ne va pas pouvoir présenter un certificat valide, en tout cas signé par une autorité de certification reconnue, donc le serveur va jeter.

**[29:25]** Donc sur Internet, on va dire que 90% du boulot est fait sur les serveurs qui sont frontaux. Les TLD, c'est réglé. Les racines, c'est réglé depuis longtemps. Donc en fait, le lien entre les TLD et les racines, tout ça c'est du DNSSEC maintenant. On ne peut plus usurper un TLD, on ne peut plus usurper là-haut tout en haut de l'architecture DNS. Vous voyez de quoi je parle ? Là c'est du DNSSEC partout. Ils sont tous auto... ils sont tous reconnus les serveurs.

**[29:50]** Mais en dessous, c'est pas le cas parce que c'est des serveurs d'entreprise, c'est les serveurs de l'école. Et si Pascal il ne met pas DNSSEC, ben il ne met pas DNSSEC ! Et vous à l'école, vous pouvez très bien faire ça sans aucun problème, et je vous rassure : ça marche ! Donc ne le faites pas. Mais ça marche. Il faut juste que je sache que vous faites des... et puis moi je réponds au serveur de l'école en UDP DNS et je dis que Google c'est 5.5.5.5 et d'un seul coup toute l'école part sur 5.5.5.5.

**[30:19]** Le problème c'est qu'il faut que je trouve ce moment-là où c'est plus dans le cache. Donc qu'est-ce que je fais ? Je le fais en permanence, à un moment donné je trouverai ce moment. Tant que c'est dans le cache, si c'est dans son cache il répond, il ne cherche pas à comprendre. C'est dès que c'est plus dans son cache, donc il arrive au TTL de fin, il refait une requête et là moi pam pam pam ! Ça marche avec le DNS de l'école. Parce que DNSSEC c'est chiant, faut mettre une... faut remettre une PKI, machin. Et voilà. Donc sur l'infrastructure ça marche, dans les serveurs d'entreprise c'est assez peu déployé parce que un peu plus complexe à mettre en place.

**[31:02]** Donc ce qu'on appelle... Donc ça c'est aussi une... Alors il y a une vulnérabilité entre un primaire et un secondaire. Vous avez vu que les DNS ça marche par deux, on en met toujours deux. Dès qu'il y en a un qui tombe, comme vous avez les deux adresses IP, si celui-là ne répond plus vous essayez la deuxième et elle marche. Et du coup vous avez des transferts qui se font parce que moi quand je configure mon DNS, je configure celui-là. Tout à l'heure, l'interface que je vous ai montrée, je configure le primaire. Et le secondaire, comment il va savoir que ça a changé ? Bah il y a des échanges de zone qui se font.

**[31:33]** Et maintenant, ces échanges de zone qui se faisaient en clair, vous pouviez vous faire passer pour un DNS secondaire et demander au primaire : « Tiens, transmets-moi ta zone, je suis ton secondaire. » « Ah bien sûr mon garçon ! » Et là vous récupérez toute la conf DNS du primaire. Eh ben pareil : DNSSEC ! Le primaire et le secondaire se font confiance par certificat, point barre. C'est la même chose, c'est la même la même solution : c'est DNSSEC qui résout le problème d'une zone de transfert où tout était en clair et vous pouvez vous faire passer pour le secondaire et demander un transfert de zone.

**[32:02]** Ça, à l'école on l'a protégé, le transfert de zone. Si vous le demandez, si vous n'avez pas l'adresse IP du secondaire, il va falloir usurper le secondaire en adresse IP, adresse MAC. Il n'y a pas DNSSEC, je vous le rappelle, ils ont été incapables de le mettre, mais le transfert de zone il va falloir faire quelques manips réseau pour y arriver. D'accord ? Donc un attaquant se fait passer pour le secondaire et demande au primaire un transfert et récupère toute l'information de l'entreprise. C'est nul.

**[32:31]** Dernière... Alors c'est pas une vulnérabilité, c'est justement un moyen de faire sortir de l'information. C'est magique ! Nous on l'a utilisé sur une manœuvre de l'OTAN. C'est grâce à ça, je vous l'ai raconté déjà ça, on avait gagné un challenge contre... Donc il y avait en face de nous il y avait des Belges, des Hollandais, des Américains et on a pu faire sortir de l'information sans que personne ne s'aperçoive de rien, donc on a gagné le challenge.

**[32:56]** C'est que une requête DNS, donc vous faites une requête en nom, en adresse IP, en service, en texte, il y a tout un tas d'options dans la réponse. C'est pour ça que c'est 3000 octets la réponse, c'est une réponse de débile. Et vous pouvez mettre plein d'options : option 1, option 2 dans la réponse. Et donc c'est le serveur qui met : « Ben tiens, en option 2 je mets 100, en option... » Et c'est des champs qui sont quasiment libres. Vous voyez, dans la réponse DNS, il y a des champs optionnels où vous mettez ce que vous voulez là-dedans, ça fait partie de la réponse du DNS.

**[33:28]** Eh ben on va utiliser ça, ces champs-là, pour faire sortir de l'info. Le but du jeu, c'est que vous êtes dans une entité où c'est cloisonné, il y a un pare-feu, il y a tout, où on vous dit que vous ne pouvez pas sortir de l'info, eh ben vous faites un tunnel DNS vers un serveur DNS que vous maîtrisez sur Internet. Dessus, vous mettez le projet Iodine (DNS 53, Iode 53 dans le tableau de Mendeleïev, c'est pour ça que le projet s'appelle Iodine).

**[33:53]** Et donc vous mettez ce petit serveur DNS Iodine sur Internet, vous vous êtes dans la zone ultra protégée où il n'y a rien qui sort, tout est verrouillé partout, et vous faites juste des requêtes DNS vers votre serveur Iodine. Et dans les options, vous bourrez tout ce que vous voulez ! Et c'est bien du DNS qui rentre et qui sort. Un pare-feu, il va regarder : « Ouais, c'est du DNS, c'est conforme. » Sauf que vous avez bourriné les champs optionnels de pleins de saloperies consécutives pourquoi pas d'un protocole de jeu.

**[34:24]** C'est comme ça qu'on a gagné le challenge. Au bout de deux jours, on a dit « Nous c'est bon, on a sorti de l'information, on est Français. » Un challenge qui a duré une semaine. Donc au troisième jour, on a demandé de faire une preuve de concept qu'on avait sorti de l'information. Le jury est venu dans le shelter (c'était à l'armée, tous en treillis), ils sont venus et on jouait tous à Quake 3 en réseau ! Et on faisait passer le protocole de jeu dans les champs texte optionnels du DNS. Et les pare-feux belges, hollandais et américains n'y ont vu que du feu. Et nous on jouait tranquillement à Quake.

**[35:00]** Ça permet de faire fuiter de l'info quand tout est verrouillé. Ça marche très bien. Iodine. Et vous retrouverez des pseudos de certains de vos profs dans le projet Iodine, normalement.

**[35:18]** Dernière attaque sur les DNS, donc on en a parlé tout à l'heure, c'est les attaques homographiques. Des lettres qui se ressemblent, ça s'appelle des homoglyphes et le mot composé de tout ça s'appelle un homographe en vocabulaire. Donc là, l'idée c'est de cloner le `apple.com` et là c'est exactement ça : c'est quasiment impossible de voir que là c'est écrit en russe.

**[35:48]** Donc ce que font les navigateurs aujourd'hui, ils transforment tout en punycode, c'est-à-dire en ASCII. Alors normalement le DNS c'est de l'ASCII, donc ils transforment de l'ASCII en ASCII donc vous ne voyez pas, il n'y a pas de différence. En revanche, si on commence à écrire en cyrillique, vous allez voir ça affiché à l'écran : plutôt que le "a", vous allez voir `u340`.

**[36:11]** Il n'y a que Chrome qui met toute la barre en rouge. Il l'affiche en punycode (donc en ASCII), donc ça sera `apple` va être écrit `u61`, le "p" je ne sais pas ce que c'est, `u70` machin tatata, mais du coup ce ne sera pas ces valeurs-là, ça va être des valeurs à la con : 20430 parce que c'est le caractère russe numéro 20430 dans le ASCII étendu je ne sais pas quoi. Et donc comme c'est transformé en ça, vous voyez tout de suite que c'est pas un "a" ASCII, mais c'est un "a"... Et quand Google s'aperçoit de ça, il met toute la barre en rouge. Les autres mettent juste le code punycode. Google rajoute du rouge. C'est bon ? Voilà. Donc ça normalement, ça ne devrait plus vous emmerder sur Internet ce genre de truc.

---

### [37:32 - 56:39] HTTPS, Handshake TLS, Inspection profonde SSL d'entreprise et Dérive des mots de passe

> 🎯 **[POINT EXAMEN / CYBERSÉCURITÉ] Inspection SSL/TLS d'entreprise (Deep Inspection) :**
> - Le pare-feu (Fortinet, Stormshield) déchiffre le HTTPS, analyse les flux (DLP, antivirus) et rechiffre avec son propre certificat.
> - **Pourquoi le cadenas reste vert sur le poste client ?** L'autorité racine interne du pare-feu a été injectée dans le magasin de certificats du navigateur via une **GPO Active Directory**.

**[37:32]** Quel est le problème avec HTTPS ? HTTPS, OK on vous a dit ça sécurise le transport des pages web. C'est imposé par le serveur, c'est pas vous qui décidez en tant que client de faire du HTTPS, vous vous connectez sur 443. C'est lui qui va imposer. Et donc le serveur doit s'authentifier par un certificat signé par une autorité que vous devez reconnaître. Et c'est dans ce cadre-là que vous considérez que la liaison est safe. Là, il y a déjà deux problèmes. On va évoquer ensemble.

**[38:23]** Je rappelle comment fonctionne HTTPS rapidement : vous êtes là, tranquille pépère, vous faites une requête sur 443 et le serveur vous impose HTTPS et vous dit : « OK, bonjour, on va faire quelque chose d'un peu chiffré si ça ne vous dérange pas et voici mon certificat. » Dans les réponses, et ça c'est en clair. Tout ça, c'est en clair ! Si vous prenez Wireshark, c'est tout en clair.

**[38:50]** Là on est en clair : voici mon certificat. Vous avez le certificat du serveur qui est arrivé et lui donc quand le certificat arrive, la première chose qu'il fait c'est : il vérifie par rapport à sa liste des autorités de certification dont il a la clé publique, il va vérifier que le certificat est bien signé par une autorité que lui-même a reconnue.

**[39:13]** Comment ? Il fait l'empreinte du certificat, il vérifie la signature avec sa clé publique puisque cette signature a été faite avec une clé privée. Si ça matche, c'est que c'est bon et que c'est bien une autorité qui est reconnue. On est sur le système clé publique, clé privée standardisé quoi. Embarquée dans un certificat, c'est tout. La clé publique, elle est embarquée dedans. Ça vous va ? Très bien.

**[39:40]** Normalement, HTTPS dans la RFC, il y a pas de bis là : c'est que une fois que le serveur a envoyé son certificat, le client envoie son certificat client au serveur signé par une autorité reconnue, le serveur fait la même manip : je vérifie que... lui. Sauf que là comme il n'y a pas un homme, bah si ça marche pas c'est échec.

**[40:06]** Alors que là ce que vous pouvez avoir, c'est avoir une espèce de certificat pas signé par une autorité reconnue et donc votre navigateur il vous met une page en disant : « C'est pas reconnu, est-ce que tu veux quand même continuer ? » Il y a une interaction humaine où on vous laisse la possibilité de continuer. C'est là le problème, il est là le problème ! Et qu'en plus on ne vous impose pas d'envoyer le certificat client qui aura donc une ce qu'on appelle l'authenticité réciproque.

**[40:36]** Le système commercial mondial a toléré qu'on n'ait pas ça. Alors que dans le protocole TLS, ça n'existe pas de péter une guibole à ce truc-là. Mais on l'a toléré. Pourquoi ? Parce qu'on a dit : « Mais ils vont pas les gens là, ils en font quoi de leur certificat ? Ils le mettent dans quel répertoire ? Puis quand ils ont paumé leur PC, quand ils ont cassé leur PC, quand ils ont donné leur PC, il devient quoi ce... Ils ne vont pas savoir faire, ils sont trop cons ! » Donc on ne va pas faire de certificat client.

**[41:06]** Là c'est le premier problème. Là ça y est, la boîte de Pandore est ouverte : plus de certificat client, ça veut dire que le serveur web ne sait pas qui vous êtes. Vous êtes n'importe qui ! Vous, vous êtes sûr a priori presque, s'il n'y a pas de warning ici de OK, il est bien ce serveur, mais lui il sait pas qui vous êtes. Donc là c'est une banque, là c'est Amazon, donc il faut... Elles aussi, lui il a besoin de vous authentifier, de vous identifier qui vous êtes.

**[41:35]** Et c'est parti : login/mot de passe ! Et c'est et c'est la merde ! C'est baisé le système ! Les mots de passe vous les oubliez, les mots de passe vous les faites voler, les mots de passe ils se font bruteforcer. On est dans une situation aujourd'hui où on ne sait plus se démerder de ça.

**[41:52]** Alors que si on avait fait un petit effort dans les années 90 et on avait appris à tout le monde comme ses clés de maison à gérer un certificat, il n'y aurait jamais eu de login/mot de passe sur la planète. Le login et le mot de passe est une notion qui n'aurait pas existé. On présentait un certificat, c'était réglé.

**[42:12]** La seule protection qu'il y a, c'est comme ce certificat il est stocké sur votre sur votre machine, pour l'ouvrir afin de pouvoir l'envoyer, pour le rendre disponible aux applications, il faut mettre un mot de passe là-dessus. Sinon aucune application ne peut l'utiliser. Et là c'est à vous qu'on demande : « Telle application veut utiliser votre certificat, OK ou pas OK ? Mot de passe. » Et donc toute personne sur la planète n'aurait eu qu'un seul mot de passe à se rappeler.

**[42:38]** Ce qu'on fait aujourd'hui avec les gestionnaires de mots de passe où on leur dit : « Ça va être génial, vous n'avez plus qu'un seul... » Putain, c'était ça la base qu'on voulait faire ! Les boules hein ! On a loupé un truc. La planète a loupé un truc.

**[42:58]** Et maintenant, comme on ne peut plus gérer ici qui est qui, les logins/mots de passe c'est tout pourri, eh ben eux ils demandent : « Es-tu bien sûr d'être bien toi ? Je t'envoie un SMS et puis tu me valides, ou je t'envoie une clé sur ton application bancaire, ou je t'envoie... » Voilà, on est dans un bordel ambiant où plus personne ne s'en sort, on ne sait pas quoi sortir pour être certain d'être certain que l'autre est bon. C'est le merdier absolu. On a juste loupé un truc. Faites-le savoir parce que peut-être qu'un jour on fera demi-tour et on reviendra aux certificats clients qu'on nous donnera au même titre qu'une carte d'identité.

**[43:36]** Bien. Alors ça c'est bis, ça a plus lieu. En fait, alors quand est-ce qu'il est envoyé ? Quand le serveur le demande. Le serveur peut dire : « Moi je ne continuerai que si tu me donnes ton certificat client. » Et à ce moment-là, eh ben donc c'est des... certaines entreprises font ça. On a des certificats clients qui sont envoyés parce que la PKI d'entreprise fait que chaque salarié a son certificat pour rentrer sur son VPN par exemple.

**[44:01]** Par exemple là c'est un serveur VPN, là je suis à la maison en télétravail, eh ben non, je décide (c'est ce qu'on a fait à l'école), je décide de... Le serveur VPN dit : « Moi si tu m'envoies pas ton certificat, je ne fais rien. » C'est pas un login/mot de passe, c'est pas une fausse page web qui va se faire prouter par le premier pirate de la... voilà. Et c'est les entreprises qui imposent à leurs salariés un certificat qui ne sert que dans un cas : le VPN. Pas pour aller sur Internet, pas pour faire tout ça.

**[44:28]** OK, donc je... Alors ça on oublie sur Internet, c'est le cas des VPNs dans beaucoup d'entreprises, vous apprendrez ça avec la certification Stormshield. La PKI est dans le boîtier. Et donc bon on oublie donc, et une fois que vous avez reçu ça, vous avez dans le certificat vous trouvez la clé publique, vous allez l'utiliser pour générer une clé de session, donc une clé pour un algorithme symétrique maintenant. Et cette clé, vous la chiffrez avec la clé publique reçue dans le certificat.

**[44:57]** Le seul qui peut déchiffrer cette clé, c'est celui qui a la clé privée, on est d'accord. Donc le serveur déchiffre avec sa clé privée, récupère donc la clé de session que vous lui avez envoyée, algorithme symétrique, et c'est parti : échange chiffré avec une clé symétrique et un algorithme symétrique qui n'est pas gourmand comme un algorithme asymétrique. Donc asymétrique pour échange des clés, symétrique pour faire le boulot. Ça vous va ? Bon. Donc déjà, je vous ai dit il y a un premier problème, c'est qu'on ne fait plus ça. Ça c'est très embêtant.

**[45:34]** Donc le problème, il est que : est-ce que il n'y a que ce certificat dans ce sens et du coup sur la ligne, n'existerait pas-t-il quelqu'un qui foutrait le bordel ? Sur la ligne entre le serveur web et vous, est-ce qu'il n'y aurait pas un Man-in-the-Middle, quelqu'un qui regarde ? Alors ça peut être le pare-feu de l'entreprise qui regarde, qui voit tout ce qui passe.

**[46:00]** Ça peut être un outil de sécurité qu'on verra demain qui s'appelle un EDR, voilà, donc qui est intégré dans la machine là, qui regarde avant de que les flux aillent dans le navigateur, lui qui est installé là-dedans ça passe par lui. Ou ça peut être un pirate qui a fait un petit Man-in-the-Middle sur le Wi-Fi de l'hôtel et qui s'est mis entre vous et Internet. Et donc il va vous filer un faux certificat.

**[46:21]** Alors ça peut être un vrai ou un faux certificat, c'est ça le problème. Si c'est un pirate, ça sera un faux certificat. Il n'a pas la capacité à faire signer un certificat par une autorité racine. Le pirate, il va fabriquer des vrais enfin des faux certificats. Donc là vous aurez des gros warnings en disant : « Attention ! Vous voulez aller sur la banque mais c'est pas le certificat de la banque, est-ce que vous voulez quand même continuer ? » Ça c'est la connerie de l'homme qui est derrière : tu fais ou tu fais pas. Ça on n'y peut rien.

**[46:48]** Maintenant, quand c'est le pare-feu de l'entreprise, c'est très embêtant parce que le pare-feu de l'entreprise, il est connecté à un Active Directory et l'Active Directory a envoyé dans tous les postes des collaborateurs le certificat de l'autorité de certification de l'entreprise. Et donc le pare-feu de l'entreprise, il a le certificat de l'autorité, ce qui fait qu'il déchiffre ce flux et il vous le rechiffre pour vous avec un certificat que vous reconnaissez parce qu'on vous l'a on l'a envoyé par l'AD via les GPO que vous avez vues en 4ème année.

**[47:19]** Et du coup, il n'y a pas... Le cadenas il est vert, il est tout vert ! Tout est bon ! Vous recevez un flux chiffré d'une autorité reconnue, tout est vert. Or si vous regardez le certificat, c'est marqué « Chiffré par esia.fr ». Il y a un problème : il y a quelqu'un au milieu qui a le clair de tout ce que vous faites sur Internet et qui en fait ce qu'il veut : qui le stocke, qui le donne, qui le vend. Et vous n'y voyez rien, le cadenas il est vert ! Le cadenas il est rouge que dans ce cas-là.

**[47:54]** L'EDR, quand Cyrielle a fait des essais, ils n'utilisent plus cette méthode pour déchiffrer les flux. Ils sont mieux parce que comme ils ont accès à la mémoire vive de votre ordinateur, ils vont chercher le clair directement dans la mémoire vive. Pas besoin d'emmerder à casser HTTPS, les antivirus et les EDR.

**[48:14]** Mais on a deux scénarios où vous vous faites baiser : 1, parce que vous êtes trop con, vous avez dit « OK j'y vais quand même » ; 2, bah vous n'y pouvez rien, il y a un équipement de sécurité qui casse le TLS pour vous et vous votre cadenas il est vert parce que cet équipement via l'AD vous a envoyé son certificat racine.

**[48:30]** C'est pour ça qu'on a fait check-my-HTTPS : donc un produit qui va s'assurer quoi ? C'est très simple : que ça, est-ce que c'est le même que lui ? Donc pour vérifier ça, j'ai une seule contrainte : il faut pas que je sois derrière les méchants. Si je suis là, je me fais baiser aussi. Donc je vais mettre un serveur quelque part ailleurs sur la planète, je vais prendre la requête que lui il a faite, je vais l'envoyer au serveur et le serveur va faire la même requête sur le serveur web. J'ai plus qu'à checker que le certificat qu'il m'envoie, c'est le même qu'il a reçu là. Et le tour est joué.

**[49:05]** Donc un Man-in-the-Middle, je vous dis pas comment ça marche, vous le savez mieux que moi. Le Wi-Fi c'est la même chose. Voilà les pages qui sont qui sont affichées quand vous avez un faux certificat. On vous dit « Nanananana », donc que dois-je faire ? Comme tout le monde disait « J'y vais quand même », on a habitué les gens à accepter des faux certificats. C'est grave hein ! On a habitué les gens à accepter des faux certificats.

**[49:30]** Aujourd'hui les navigateurs ont mis en place une sécurité complémentaire qui consiste à... Pourquoi des fois vous ne pouvez plus accepter un faux certificat ? Est-ce que vous le savez ? Tous vos navigateurs ont mis ça en place : dès que vous allez vous êtes allés sur un site web, je prends `amazon.fr` au hasard, vous avez reçu le certificat d'Amazon la première fois. À partir de ce moment-là, vous avez reçu une fois le certificat d'un site, le navigateur considère que ce certificat c'est celui qui fait foi.

**[50:08]** Et la prochaine fois que vous irez sur Amazon, si on vous en présente un autre, il vous dira ça et il ne vous donnera pas la possibilité de contourner parce qu'il a un certificat déjà qu'il a vu et là c'en est un autre. Il vous proposera de contourner la sécurité si c'est la première fois qu'il va sur le site, que le certificat n'est pas reconnu, mais comme il n'a pas de référence, eh ben il vous dit : « Tu as le droit de... Vas-y si tu veux continuer, tu continues. » Ça vous va ça ?

**[50:35]** OK. Si vous supprimez ce certificat qui est stocké, vous allez dans la liste des certificats stockés, vous oubliez ce site et du coup ça refonctionne. Pourquoi ils ont fait ça ? Parce que par exemple, vous allez vous connecter sur un de vos switchs pour l'administrer, ça sera du HTTPS. Le switch, il va vous présenter un faux certificat. Le switch il a pas d'autorité de certification, enfin voilà, il va vous faire du HTTPS avec un faux certificat, avec quelque chose qui a été auto-signé. Il n'y a pas de... Vous n'avez pas l'entreprise n'a pas payé une chaîne de certification pour le switch.

**[51:12]** Et là, il ne faudrait pas que vous soyez bloqués, vous ne puissiez plus administrer votre switch parce que votre navigateur dit « Non, pas question, nanana. » Donc c'est pour ça qu'on peut toujours outrepasser le fait que le certificat n'est pas n'est pas d'autorité. Vous voyez ? C'est une mesure, elle vaut ce qu'elle vaut, mais au moins vous saurez quand vous quand vous allez sur un site et que vous ne pouvez pas dire « J'accepte » tout ça, c'est parce qu'il y a déjà un certificat qui a été vu une fois et que là vous êtes vraiment avec un faux site.

**[51:54]** Bien, mais bon les gens acceptent le plus souvent. Donc là bah typiquement Fortinet, les pare-feux Fortinet ils ont ça en dessous directement. C'est on met le certificat de l'entreprise et on va dans la coche marquée Deep Inspection (inspection profonde) et tous les paquets en HTTPS sont déchiffrés et analysés par le pare-feu. Automatiquement.

**[52:17]** Et vous, vous avez un certificat qui vous est fourni par le pare-feu, mais comme lui il l'a il l'a signé par l'autorité de votre entreprise qui a été renseignée dans votre navigateur web, bah pour vous tout est vert. Alors que c'est pas du tout le certificat de la banque, c'est pas du tout le certificat d'Amazon, c'est un certificat Fortinet. Ou autre. OK ? Et donc tout le monde tout le monde est avec des faux certificats, c'est la fête du slip.

**[52:47]** Donc nous on a dit : ça il faut au moins que l'utilisateur il ait un moyen de checker ça. C'est trop compliqué de lui expliquer comment ça marche, les certificats personne ne comprend que dalle, on est d'accord. On n'est pas là pour dire : « Attention, regarde, glisse ce swap, voilà. » On essaie de faire un truc très très simpliste pour qu'au moins : c'est vert, c'est pas vert. Si c'est vert c'est que c'est bon, sinon c'est que c'est pas bon.

**[53:11]** Donc comment ça marche ? Donc c'est le problème d'origine. Et nous on a monté donc un agent, un client qui est dans votre téléphone, PC, ce que vous voulez, dans votre navigateur. Et quand vous requêtez check-my-HTTPS, il y a un serveur qui vous attend. Ce serveur c'est le nôtre, mais vous pouvez mettre le vôtre. Sur le Git il y a tout, vous mettez votre propre serveur.

**[53:37]** Thales a son propre serveur check-my-HTTPS, les 4 ministères français ont leur propre serveur check-my-HTTPS et leurs collaborateurs, quand ils sont à l'étranger, ont l'obligation de faire un check avant d'ouvrir les VPN, avant de consulter les banques ou des trucs comme ça. C'est leur propre serveur, parce que vous n'êtes pas obligés d'avoir confiance en mon serveur.

**[53:56]** Et là, dès que vous cliquez check, ça va prendre le ça va prendre le nom du site que vous voulez voir, ça va l'envoyer au serveur check qui est à l'extérieur de la zone hostile, il va faire la même requête, il récupère le certificat du serveur, il en fait une empreinte, il envoie l'empreinte à l'agent qui lui compare : est-ce que les deux empreintes de certificats sont identiques ? Si elles sont pas identiques, il y a un loup ! Il y a un loup. Voilà, c'est rouge.

**[54:33]** Et je crois que toutes les petites semaines, j'ai des des mails de gens qui sont partis sur la planète... On en est sûr, Cyrielle s'en est occupée, on en est sûr. Quand c'est rouge, c'est rouge ! Elle dit : « Bon OK d'accord, alors parce que là je suis à tel endroit, c'est rouge. » « Ah ouais, à tel endroit c'est normal. » Sachez qu'il y a des pays, il n'y a pas qu'en Chine, il y a plein d'autres pays où il y a une barrière frontalière numérique où tout est cassé, tout est regardé, tout est... C'est bien de le savoir. Bon voilà. Et donc c'est rouge, c'est vert, voilà.

**[55:08]** Et donc il y a des clients des clients, ce sont des clients, il y a des applications Android, il y a des des modules pour navigateur Chrome, Firefox, etc., etc. Dans un des PS T5 qu'on vous propose, il y a une toute petite modif à faire parce que Cyrielle a commencé puis il faut faire la suite. Si ça vous intéresse.

**[55:33]** Alors c'est pas pour faire la pub de check-my-HTTPS que je fais ça, mais c'est pour que vous compreniez le problème du HTTPS au sens large. Du certificat client qui a été pétardé, ça c'est le problème initial et maintenant on s'en sort plus de ce truc-là, et deux bah des des actions d'inspection profonde sur les individus. Bien.

---

### [56:39 - 79:33] Législation CPCE (Logs 1 an), DMZ / Air-Gap, et NAC / Portail Captif (Alcasar)

> 🎯 **[POINT EXAMEN / CADRE LÉGAL OBLIGATOIRE] CPCE (Code des Postes et des Communications Électroniques) :**
> - **Obligation légale :** Toute entité offrant un accès réseau (entreprise, FAI, hôtel, université, bar) DOIT conserver pendant **1 an** les données techniques de connexion (IP source/dst, ports, horodatage, identifiant cellulaire de l'utilisateur, géolocalisation).
> - **Conservation des données d'identité :** 5 ans.
> - **Sanctions pénales :** Engagement direct de la responsabilité pénale du dirigeant (amendes, prison, fermeture administrative).

**[56:39]** Dans une entreprise, grosso modo une entreprise elle a un réseau local, un accès avec un routeur de sortie sur Internet, un point d'accès Wi-Fi pour les collaborateurs qui sont en Wi-Fi et puis elle sépare des réseaux qui traitent des données sensibles des réseaux qui traitent des des des des données non sensibles par souvent un air-gap.

**[57:07]** Pourquoi pas de VLAN ? Bah parce que parfois le VLAN, vous avez vu, le VLAN hopping, il y a une menace sur les VLANs. Et donc il y a des entreprises, leur niveau de sensibilité, pas toute l'entreprise, c'est des endroits dans un compartiment, est tel qu'elles considèrent que le VLAN c'est pas sécure.

**[57:24]** Et donc on fait un air-gap, donc on fait des réseaux physiques séparés, c'est tout. Et puis si on doit transiter faire transiter des données de l'un à l'autre, on passe par ce qu'on appelle une station blanche. Donc c'est pas toute une entreprise qui est comme ça, c'est souvent une partie R&D, la recherche en chimie, le je sais pas quoi, et voilà ici il y a des petits réseaux de 5 machines qui sont super isolés parce que bah parce que tous tous tous les moyens d'interconnexion ne sont pas safe. Et donc on met des stations blanches. Pour faire représenter ça d'une manière un peu générique.

**[58:00]** Bon, donc les approches commerciales là c'est de vérifier cette tout tout le fonctionnement de ça, soit en approche Red Team, c'est-à-dire ben je je viens auditer, tester, pentester, faire ça, et puis des approches Blue Team où sans être attaqué, je mets en place tout un système de surveillance et de protection, le MAC Locking, le machin, tout ce qu'on peut imaginer dans les dans les switchs qu'on a vu ensemble. Et je surveille.

**[58:27]** Maintenant, vous avez vu que dans le schéma que je vous ai présenté là, il y a un accès à Internet avec ou pas des modules de sécurité, on va appeler ça des DMZ, des pare-feux là, on va voir ce qu'il y a là dedans. Mais comme actuellement on va on va sur Internet soit parce que j'y j'y trouve un intérêt, soit parce que j'ai aussi mes serveurs qui sont dans le cloud, est-ce que je peux connecter mon entreprise à Internet comme ça sans rien faire ? Comme ça là. Voilà, j'y vais. Bah non. En France, ça serait trop simple. On ne peut pas faire ça. En fait, on ne peut pas trop le faire, mais il prend un très gros risque à faire ça, à mettre un routeur et puis à dire à ses collaborateurs : « Allez, c'est open bar, allez-y ! » Non, ça marche pas tout à fait comme ça.

**[59:15]** Donc pour savoir comment ça marche, c'est pas compliqué, vous allez lire la loi. Je vous la laisse la lire, c'est pas moi qui l'ai inventée donc je n'ai pas à la réécrire. Donc cette loi s'appelle le CPCE (le Code des Postes et des Communications Électroniques), donc qui a été qui est assez vieux (2021), mais qui a été modifié en 2025. Pourquoi ? Parce qu'en 2024, la Commission européenne a mis une amende sur la France parce que la France était un peu trop restrictive par rapport à l'accès Internet des salariés.

**[59:47]** Dans une dans une loi française qui s'appelle la LCEN (la Loi de Confiance en l'Économie Numérique), la France a écrit : les entreprises doivent tracer tous leurs salariés, garder les traces pendant un an de toutes les connexions qu'ils font sur Internet et tout ça, ça doit contribuer au système antiterroriste tout ça. Dans une loi ! La France a fait ça, les autres pays en ont fait beaucoup moins que nous.

**[60:08]** Et la Commission européenne a dit : « Non, là vous allez beaucoup trop loin par rapport à ce que demande l'Europe. » Ils nous avaient déjà dit ça en 2021, ils nous disent une deuxième fois, ils ont dit : « Maintenant, c'est tant par semaine d'amende. » Donc la France a pris son texte de loi de la LCEN, puisque l'Europe a un droit de regard sur nos lois, et on l'a juste transféré dans un code, qui est un ensemble de lois pour lequel l'Europe n'a pas droit de regard. C'est pour ça qu'en 2025, on a transféré ce qui était dans la LCEN dans le CPCE et on fait "mouck" à l'Europe parce que c'est nous qui décidons du niveau de sécurité qu'on va mettre en France. Voilà !

**[60:45]** Donc vous allez pouvoir lire ce qui est écrit maintenant dans ce CPCE. Il y a un décret en 2025 qui explique comment faire. Là on vous dit quoi faire, et là on vous dit comment faire. On vous dit qu'il faut tracer, qu'est-ce qu'il faut tracer, mais surtout vous me géolocalisez les utilisateurs, je veux savoir où ils sont dans les traces. Pas simple hein ! Commencez à réfléchir là, vous êtes une entreprise et puis on vous dit on vous dit tout ça.

**[61:20]** Donc ce qu'il y avait écrit dans la LCEN que l'Europe ne voulait pas voir, nous on l'a réécrit. Alors on a dit : les opérateurs de communication. Donc vous êtes patron d'entreprise : « Je ne suis pas concerné par ça. L'opérateur de communication, il est là. C'est pas mon problème. Si lui il doit tracer, bah qu'il trace ! Tracez, opérateur de communication. Moi je suis patron d'entreprise, j'utilise votre box, mais c'est bien à vous qu'on a demandé de tracer. »

**[61:48]** Le CPCE, il parle des hébergeurs. Dans la LCEN, il n'y avait pas les hébergeurs, il n'y avait que les opérateurs de communication. Ils ont rajouté les hébergeurs. Donc tous ceux qui ont des données exposées et qui sont en France, doivent tracer tout ce qui rentre et ce qui sort du cloud public. Si vous offrez avec votre box que vous avez un forum que vous proposez à la communauté, vous êtes vous êtes hébergeur ! Dès que vous offrez un service sur Internet, vous êtes hébergeur. Donc vous êtes pris par la loi. OK ?

**[62:26]** Donc les opérateurs qui offrent une communication et les hébergeurs doivent identifier quiconque. Quiconque, c'est pas une adresse MAC hein. Quiconque, c'est pas une adresse IP, quiconque c'est un nom, un prénom, une personne, c'est quelque chose qu'on peut identifier, c'est de la chair humaine, c'est des cellules vivantes. Voilà. Et vous devez tracer pendant un an et les données d'identité les garder pendant 5 ans sur votre petit forum dans votre Freebox là, votre serveur FTP planqué je ne sais pas où, vos petites vos petits sites web chez vous là. Vous devez tracer tous ceux qui rentrent.

**[63:03]** « Bah fais-le pas, c'est ton problème ! » Moi je suis là pour vous donner la loi, que vous le fassiez ou vous le fassiez pas, j'en ai rien à battre, c'est votre problème. Comme les gens n'ont pas tout compris, ils se sont dit : « Hmm, donc moi je suis patron, je ne suis pas concerné. J'ai pas de site web, OK. Je ne suis pas opérateur de communication, donc c'est réglé. »

**[63:28]** Et donc on on ajoute à la loi : les personnes (c'est une personne, une personne morale, qui au titre d'une activité professionnelle ou accessoire, activité accessoire : patron d'entreprise, c'est c'est mon boulot c'est pas de donner les de la communication aux gens, mais oui mes salariés ont droit à la communication), offre au public (les salariés) une connexion, oui, en ligne, eh ben ils doivent faire pareil que les opérateurs. Donc là, derrière la box, vous devez faire ce que les FAI font déjà. Les FAI, ils stockent tout.

**[64:06]** Et vous, vous devez disposer en tant que... Bah Loïc Roussel là, voilà ! Loïc Roussel et là les étudiants de l'ESIA là. Le patron de Total Group, toutes les entités en France de Total, ils doivent faire ça. Ça en fait du monde ! Après vous le faites, vous le faites pas, c'est pas mon problème hein. Moi je vous donne la loi, c'est tout, après vous vous démerdez. Bien. Voilà, c'est à peu près clair ce qu'on doit faire.

**[64:34]** Comme comme c'est pas encore tout le monde lit pas la loi, l'ANSSI s'est fendue d'un document qui est envoyé à tout le monde via le Premier ministre pour expliquer avec des mots plus vulgarisant : allez, lisez ça. Voilà.

**[65:07]** Alors vous avez un moyen d'échapper à ça si vous avez déjà votre petit site web, votre petit site de jeu, votre petit site en public : allez le mettre en Allemagne, en Suisse, en Géorgie, en je sais pas quoi. Voilà, et vous réglez le problème. Si c'est que ça, c'est facile. Mais si vous avez votre entreprise en France, non là c'est baisé. Vous avez un hôtel, c'est baisé. Vous avez un resto, c'est baisé. Vous avez un bar et vous mettez un Wi-Fi public, c'est baisé. Vous êtes un maire et vous décidez de mettre un Wi-Fi public dans le jardin municipal, c'est baisé. Tous les maires, il faut tracer, il faut tracer, il faut tracer, il faut tracer, il faut tracer.

**[65:40]** Alors comment vous faites ça techniquement ? Allez-y, je vous écoute là. On est en 5ème année cyber, comment techniquement... vous savez où sont où est la box, vous avez le réseau, le switch, machin, tout ça, comment vous tracez tous les gens qui veulent aller sur Internet ? Comment vous feriez ? Il y a ou pas un Active Directory ? Une solution. Ça c'est quand je suis hébergeur.

**[66:17]** Là je prends le cas où je suis j'offre à mes salariés, bah Loïc Roussel, comment il ferait pour tracer ? Et d'ailleurs, c'est ce qu'il fait hein ! Parce que il y a il y a il y a quand on est arrivé à l'école, ils sont venus tous nous voir, ils nous ont dit : « Nous comment on fait là ? Parce que on a eu un rappel à la loi, ça s'appelle. Un rappel à la loi. »

**[66:40]** L'ANSSI un jour, il y a 8 ans, ça date pas d'hier quand même, a envoyé un mail au DSI en disant : « Est-ce bien raisonnable que votre adresse publique apparaît dans tels tels logs d'un serveur qui s'est fait prouter ? Est-ce que vous pouvez faire une enquête et nous dire qui est derrière ? » C'était... Alors c'était c'était avant Loïc, clairement, c'était comment il s'appelait ? Il y a l'INP-ESSA avec les deux portes qui s'ouvrent comme ça, le patron de l'époque, le directeur. Bougeaille. C'était Bougeaille le directeur.

**[67:15]** Il a il a pris le TGV, le matin il était là, il nous a montré ça, il était tout blanc parce que il avait une semaine pour régler le problème. Pour dire qui de l'école était allé sur le site en question. J'ai dit : « Mais tu sauras jamais. Il n'y a aucun dispositif actuellement à l'école qui te permet de le savoir. Tu dois tracer, c'est la loi. Donc ils te demandent les traces, tu ne les as pas. Bah maintenant, bon courage mon garçon ! »

**[67:42]** Et c'est ce qu'on lui a dit, et il est allé au tribunal, il s'est défendu, il a dit : « On n'a aucun système de traçabilité. » Donc ça s'appelle un rappel à la loi, donc il a été convoqué auprès d'un procureur qui lui a dit : « Bah voilà, la prochaine fois c'est la prison. Donc mettez la traçabilité. » Donc autant vous dire que...

**[68:03]** Et c'est arrivé à plein de bars ! Si vous cherchez un peu sur Internet, vous allez voir tous les bars à Paris qui ont fermé de façon administrative, c'est qu'à un moment donné il y a eu une enquête de police qui a dit que l'adresse IP c'est celle du bar, il y a eu tel méfait de fait, le patron a dit « Je sais plus qui c'est ». Une fois, pas deux. La deuxième fois, fermeture administrative. Des campings, des hôtels, des chaînes d'hôtels qui ont fermé, des Starbucks qui ont fermé.

**[68:36]** Allez, je vous montre la solution. Il n'y a pas une solution, il y a des solutions. Il y a des choses élégantes, ça évolue avec le temps. Pourquoi ça évolue ? Parce qu'en fait la France a été rejointe par plein d'autres pays où plein d'autres pays veulent tracer : les États-Unis en premier, la Suède, l'Europe l'a tracé maintenant parce que après nous avoir amendés, ils s'aperçoivent que c'est pas si con ce qu'on fait.

**[69:03]** Et donc, je reprends mon réseau d'entreprise : voici l'adresse IP qui est impactée dans les logs qui font l'objet d'un d'une enquête de police, pourquoi pas. C'est l'adresse IP qui est là. Là derrière, le problème vous avez compris avec le NAT, c'est mort, on sait pas qui est qui a fait quoi là-dedans parce que tout le monde sort avec la même adresse. C'est pour ça que vous devez tracer parce que il y a celle-là, on sait qui c'est, l'opérateur qui est là Free il sait, en 2 secondes la police demande à qui appartient cette adresse IP, ils demandent même pas aux opérateurs, ils ont une console, hop ils savent : c'est Free, c'est Monsieur Machin, carte bleue bidule, abonnement depuis je sais... Tout est automatisé ça.

**[69:41]** Les opérateurs, ils ont tout automatisé. Et l'opérateur peut lui filer un an de logs à l'ANSSI de de de cette adresse IP là. Un an de logs de tout ce qui passe derrière la box. En GSM, c'est pareil : si c'est votre adresse IP GSM qui est sortie publique, l'opérateur il a fait ce qu'il faut, il a vos un an de SMS, de MMS, de de de web, tout ce que vous voulez, la fête, tout ça il l'a pour un an.

**[70:08]** En revanche là, on est baisé : qui là-dedans a fait le bordel ? C'est ici qu'il va falloir tracer, là. Et puis il va y avoir des collaborateurs en filaire, il y a des collaborateurs en Wi-Fi, il y a des guests qui viennent qui n'appartiennent pas à l'entreprise. Comment on fait ?

> 💡 **[SOLUTIONS TECHNIQUES DE TRAÇABILITÉ] Pare-feu + AD vs NAC (Alcasar) :**
> - **Pour les salariés (sur Active Directory) :** Le pare-feu enrichit ses logs de trafic en interrogeant l'AD/LDAP/RADIUS pour associer instantanément l'IP/MAC à l'identité réelle du compte connecté (authentification 802.1X).
> - **Pour les invités / BYOD (hors AD) :** Redirection obligatoire vers un **NAC / Portail Captif (Alcasar)** qui intercepte, authentifie, filtre et archive les logs de connexion pendant 1 an.

**[70:30]** La manière la plus élégante de le faire est la façon suivante aujourd'hui : quand vous êtes une entreprise, généralement vous avez un pare-feu. Petit pare-feu, gros pare-feu, moyen pare-feu, on s'en fout, vous avez un pare-feu. Le problème du pare-feu, c'est qu'il trace tout. Oui, mais il trace des adresses IP et des adresses MAC. Et comme je vous l'ai dit, quiconque (marqué dans la loi), c'est pas une adresse IP, c'est pas une adresse MAC, il nous faut du cellulaire !

**[70:55]** Donc quiconque, le pare-feu il sait pas ce que c'est. Donc on achète un module du pare-feu (ça s'achète, un petit peu de sous) qui fait que pour chaque trace qui est stockée, loggée, IP/MAC, le pare-feu requête l'Active Directory pour savoir quel est l'utilisateur qui a cette IP/MAC actuellement. Et l'Active Directory le sait puisque vous êtes authentifié sur l'Active Directory. Vous, c'est en 802.1X via le Wi-Fi, donc via votre login/mot de passe, et on sait que tel à tel moment vous avez telle adresse IP, telle adresse MAC.

**[71:26]** Donc tout ce qu'on trace, on demande à l'AD : « Dis-nous qui a cette adresse IP, cette adresse MAC. » « C'est tel étudiant, c'est tel prof, c'est tel machin. » Et donc on va enrichir les logs du pare-feu de l'identifiant qui a ce ce binôme MAC/IP à ce moment-là. Et là, on a quiconque ! Ça y est, on a le quiconque. Ça vous va ça ? C'est très élégant. Les entreprises ont déjà un pare-feu, ils ont juste à acheter pour aller sur l'AD ou le serveur LDAP ou le serveur RADIUS (le serveur d'authentification) ou le 802.1X, c'est pareil.

**[72:00]** Reste un problème : les guests, ceux qui sont pas sur l'AD. Le mec qui vient là dans la rue, il prend le Wi-Fi guest et lui... Et puis dans les entreprises, on a beaucoup beaucoup ces stations-là, des stations en self-service. Parce qu'il y a des collaborateurs, ils ont pas de poste : quand vous êtes dans une boucherie, vous n'avez pas un poste ; quand vous êtes moniteur de ski, vous n'avez pas un poste de travail sur votre sur vos skis là en train de... Non !

**[72:28]** Mais l'entreprise est obligée de vous mettre à disposition des postes de consultation Internet. Elle est obligée, c'est dans la loi française. Et donc comment on fait pour authentifier les gens pour savoir que c'est lui, puis qu'après c'est un autre, ça c'est un peu chiant. L'AD ne marche pas, l'AD ne marche pas parce que c'est un truc self-service, c'est des gens qui n'ont pas de compte dans l'AD, c'est des gens qui n'ont pas de pas de de raison d'être sur le système d'information de l'entreprise.

**[72:55]** Donc à ce moment-là, pour ces gens-là, on va devoir les intercepter. Ils font du web ? Bah non, il faut les intercepter et leur dire : « Qui es-tu, toi ? Login/mot de passe. » Et là du coup le login/mot de passe, donc c'est le NAC (ça s'appelle un contrôle d'accès réseau, c'est un équipement de sécurité réseau, ça s'appelle un NAC). Et ils donnent leur pedigree, il faut qu'ils aient un compte.

**[73:17]** Ils ont été à l'accueil avant, ils ont créé un compte, c'est ce qu'ils font les gosses de l'école : ils vont voir Vanessa et ils leur disent : « Je peux avoir le Wi-Fi guest ? » « Oui », Vanessa leur donne une feuille : « Tu t'appelles comment ? Machin, montre ta carte d'identité, OK voilà, toi tu t'appelleras 204 et ton mot de passe il est marqué là. » Et ils se font intercepter par un NAC, ils rentrent et puis ils ont Internet comme ils veulent. Peut-être même mieux. Mais ils ne sont pas dans l'AD, ils sont interceptés par un par un truc qui s'appelle un NAC.

**[73:48]** Donc la solution, elle est hybride dans une entreprise, et c'est ce qu'on a à l'école : c'est-à-dire que pour tous les salariés on est sur vous êtes sur un VLAN et un SSID qui s'appelle ESIA et Groupe ESIA, ça c'est vous êtes on est sur le noir et c'est le pare-feu qui nous trace parce qu'on est authentifié sur le réseau ; et pour tous les gosses, il y a un VLAN à part, vert, avec le Wi-Fi guest (rappelez-vous, un VLAN propagé par tagging SSID guest) et puis le la réseau de consultation self-service aussi, et ça va dans le NAC et ça va sur Internet. Et eux ne peuvent pas accéder à l'entreprise. Et voilà, vous avez tout cloisonné comme il faut. Un NAC pour eux, le pare-feu pour les autres.

**[74:35]** Bon, un pare-feu c'est le cours de la semaine prochaine, donc je ne vais pas vous faire un lab sur les pare-feux, vous avez compris, donc il ne reste plus qu'un : on va faire le lab sur les NAC.

**[74:46]** Alors c'est quoi un NAC ? Trois solutions, trois solutions pour faire un NAC. 1, je vous mets toujours dans la situation de l'entreprise. La solution la plus simple pour l'entrepreneur : il loue. Il ne se fait pas chier, il appelle Orange, c'est son opérateur : « Vous avez des NAC ? » « Oui oui, ça coûte tant par mois. C'est compatible CPCE ? » (CPCE, il faut connaître ce terme CPCE). « C'est compatible CPCE ? » « Eh bah oui oui, on est français, tout ça. » Et du coup, pouf, terminé, réglé le problème, ça marche. Et donc les les les gens qui ne sont pas dans l'entreprise, qui ne sont pas gérés par l'AD, bah ils sont interceptés par la box en fait. C'est une box pro, c'est pas la box de madame Michu, c'est la Livebox Pro, la Freebox Pro, il y a un NAC dedans.

**[75:38]** Ou alors, vous avez un peu de sous, vous n'avez pas envie de payer un opérateur, et là vous achetez un NAC. Voilà. Vous allez sur Amazon, vous cherchez NAC, et vous allez trouver de l'Ucopia, du Stormshield, du Frangisecur, du Cisco ISE (donc c'est un truc qu'on rajoute au routeur Cisco). Ça s'achète. Le problème, c'est que là comme vous avez acheté, en tant que patron, vous avez l'obligation de vous assurer que le NAC fait ce que vous avez envie qu'il fasse, c'est-à-dire qu'il trace pendant un an tous les flux de tous les utilisateurs. Tous les flux : flux vidéo, audio, machin, tout. Parce que vous avez acheté un produit et devant le juge, si vous n'arrivez pas à avoir les logs, bah vous êtes dans la même merde que si vous aviez rien mis. Donc pour vous démerder, là il faut contrôler, c'est pas simple.

**[76:34]** Dernière solution : vous avez la chance, la chance d'avoir une team IT de tarés avec des Ésiarques qui vont bien, et puis vous leur dites : « Allez, mission : dans un mois, je veux un NAC qui marche avec des solutions open source. J'ai pas envie de payer, depuis que je me suis déjà payé un ingénieur, c'est pas pour encore payer du matos, donc vous allez me faire vous-mêmes le NAC. » Et donc bah là vous allez chercher des solutions open qui existent. Donc il y en a plusieurs, vous avez PacketFence, Alcasar, voilà. Le truc, c'est qu'est-ce qu'elles valent ? Est-ce qu'elles sont valides avec la loi française ? Bah ça il faut aussi le contrôler.

**[77:13]** Donc, vous me laissez un peu de temps, je mets tout ça sur Moodle : tous les cours qu'on a vus jusqu'à maintenant, je vous mets le lab. Le lab consiste, comme tous les labs que vous allez faire avec moi, de prendre une fiche LibreOffice, je vous pose des questions dedans, il suffit de renseigner et puis de me le remettre sur Moodle. Vous allez installer Alcasar, vous allez... Alors tout en virtuel hein. Tout en virtuel.

**[77:42]** Alors attention : lisez bien la doc ! Sinon vous allez vous casser les dents. Parce qu'en virtuel vous allez donc faire accès Internet, un NAC, puis des machines de consultation, tout ça c'est en virtuel. Donc essayez d'éviter de mettre du Windows en machine de consultation parce que vous allez vous bouffer toute votre mémoire et puis il y a rien qui va marcher, donc mettez un petit Linux Lite en machine de consultation. Alcasar lui il va faire sa vie, il n'a pas trop de...

**[78:10]** Et puis bah vous répondez aux questions. Pourquoi je vous demande ça ? C'est pas pour installer Alcasar, tout le monde sait faire ça. C'est que dans Alcasar, il y a des concepts de sécurité qu'on va évoquer demain en audit, en pentest et tout ça. Notamment les blacklists DNS, les blacklists de reverse proxy, des choses comme ça. Et pour pouvoir avoir la main et voir comment ça marche, bah il nous faut un outil. Les outils propriétaires, je ne les ai pas achetés, voilà. Fortinet en bas, on a interdiction d'aller voir quoi que ce soit dessus parce que tout est planqué dedans, on active des des fonctions mais on n'a pas accès aux scripts. Donc là on va voir on va voir ce que c'est qu'une blacklist, vous irez voir c'est quoi les listes de la planète pour vous amuser, par exemple. Bon courage pour cette nuit.

**[79:00]** Lisez bien la doc ! Chaque mot du lab est important. N'essayez pas de la jouer au talent, ça marchera pas. Vous pouvez le faire à plusieurs. Le but c'est de le faire, de savoir en parler vendredi. Vous pouvez le faire à deux, à trois, à dix.

**[79:18]** *[Étudiant]* : Il faut le rendre demain matin ?  
**[79:20]** *[Enseignant]* : Demain matin. Demain matin on le corrige. Laissez-moi le temps d'aller au bureau de déverrouiller. Je vous rappelle le Moodle il a été wipé, donc il faut remettre.

**[79:33]** *[Fin du cours et de l'enregistrement]*

