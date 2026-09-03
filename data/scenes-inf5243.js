/* ============================================================
   INF5243 — scènes d'attaque animées
   ------------------------------------------------------------
   Chaque scène décrit des ACTEURS, les LIENS entre eux, et ce qui
   CIRCULE à chaque étape. Le moteur est dans assets/scenes.js.

   Conventions de couleur
     nœud   s-active (bleu) · s-ok (vert) · s-warn (ambre)
            s-evil (rouge) · s-pwn (rouge clignotant) · s-dead (grisé)
     lien   s-on · s-ok · s-warn · s-evil (pointillés animés) · s-cut
     paquet p-data (bleu) · p-ok · p-warn · p-ctrl (violet)
            p-evil (rouge) · p-ghost (gris = jeté / sans effet)

   Le texte des étapes est la source de vérité : il reste lisible
   sans animation, et c'est lui qui subsiste à l'impression.
   ============================================================ */
window.SCENES = window.SCENES || {};

/* ===================================================================
   Ch. 10.4 — MAC flooding : saturer la CAM pour transformer le
   commutateur en hub.
   =================================================================== */
window.SCENES["cam-flooding"] = {
  title: "MAC flooding — saturer la table CAM",
  w: 980, h: 350,
  nodes: [
    { id: "pca", x: 25, y: 35, w: 150, h: 82, kind: "host", label: "Poste A", sub: ["MAC ..A1"] },
    { id: "atk", x: 25, y: 215, w: 150, h: 82, kind: "attacker", label: "Attaquant", sub: ["macof / Yersinia"] },
    { id: "sw", x: 290, y: 115, w: 180, h: 100, kind: "switch", label: "Commutateur", sub: ["table CAM", "8192 entrées"] },
    { id: "srv", x: 580, y: 115, w: 150, h: 82, kind: "server", label: "Serveur", sub: ["MAC ..B7"] }
  ],
  links: [
    { id: "la", from: "pca", to: "sw", label: "port 3" },
    { id: "lx", from: "atk", to: "sw", label: "port 12" },
    { id: "ls", from: "sw", to: "srv", label: "port 24" }
  ],
  panel: { x: 755, y: 30, w: 200, h: 290, title: "Table CAM", rows: [] },
  steps: [
    {
      title: "Le fonctionnement normal.",
      text: "Le commutateur apprend sur l'<b>@MAC source</b> de chaque trame qui entre. Une trame destinée à <code>..B7</code> ne ressort que sur le <b>port 24</b> : personne d'autre ne la voit.",
      set: { nodes: { pca: "active", srv: "active" }, links: { la: "s-on", ls: "s-on" } },
      panel: [{ t: "port  3 -> ..A1", s: "ok" }, { t: "port 24 -> ..B7", s: "ok" }, "port 12 -> ..C9", "", "3 / 8192 entrées"],
      packets: [{ path: ["pca", "sw", "srv"], labels: ["-> ..B7", "-> ..B7"], kind: "data", dur: 1500 }]
    },
    {
      title: "L'attaquant sature.",
      text: "Branché sur le port 12, il émet des <b>milliers de trames par seconde</b> avec une <b>@MAC source aléatoire</b> à chaque fois. Aucune faille n'est exploitée : c'est le comportement <b>nominal</b> du commutateur.",
      tone: "warn",
      set: { nodes: { atk: "evil" }, links: { lx: "s-evil" }, badges: { sw: "apprend..." } },
      panel: [{ t: "port  3 -> ..A1", s: "ok" }, { t: "port 24 -> ..B7", s: "ok" }, "port 12 -> ..C9", { t: "port 12 -> 5e:2f:a0:11", s: "warn" }, { t: "port 12 -> a1:03:7d:c4", s: "warn" }, { t: "port 12 -> 7c:bb:19:e8", s: "warn" }, "", "6 431 / 8192 entrées"],
      packets: [
        { link: "lx", label: "src 5e:2f..", kind: "evil", dur: 750, at: 0 },
        { link: "lx", label: "src a1:03..", kind: "evil", dur: 750, at: 220 },
        { link: "lx", label: "src 7c:bb..", kind: "evil", dur: 750, at: 440 },
        { link: "lx", label: "src 0d:91..", kind: "evil", dur: 750, at: 660 }
      ]
    },
    {
      title: "Débordement.",
      text: "La CAM est <b>finie</b>. Une fois pleine, les entrées les plus anciennes — les <b>légitimes</b> — sont <b>évincées</b> au profit des fausses.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw: "evil" }, links: { lx: "s-evil" }, badges: { sw: "8192 / 8192 — PLEIN" } },
      panel: [{ t: "port  3 -> ..A1   ÉVINCÉE", s: "gone" }, { t: "port 24 -> ..B7   ÉVINCÉE", s: "gone" }, { t: "port 12 -> 5e:2f:a0:11", s: "evil" }, { t: "port 12 -> a1:03:7d:c4", s: "evil" }, { t: "port 12 -> 7c:bb:19:e8", s: "evil" }, { t: "port 12 -> 0d:91:44:2a", s: "evil" }, "", { t: "8192 / 8192 — SATURÉE", s: "evil" }],
      packets: [
        { link: "lx", label: "src 4b:c0..", kind: "evil", dur: 700, at: 0 },
        { link: "lx", label: "src ef:22..", kind: "evil", dur: 700, at: 200 },
        { link: "lx", label: "src 18:9d..", kind: "evil", dur: 700, at: 400 }
      ]
    },
    {
      title: "Repli en inondation.",
      text: "Le poste A réémet vers <code>..B7</code>. Le commutateur ne sait plus où elle est : il fait ce qu'il fait toujours dans ce cas, il <b>inonde tous les ports du VLAN</b> — <i>unknown unicast flooding</i>.",
      tone: "evil",
      set: { nodes: { atk: "pwn", sw: "evil" }, links: { lx: "s-evil", ls: "s-warn", la: "s-warn" } },
      packets: [
        { path: ["pca", "sw"], label: "-> ..B7", kind: "data", dur: 800, at: 0 },
        { link: "ls", label: "..B7 ?", kind: "warn", dur: 900, at: 900 },
        { link: "lx", dir: -1, label: "..B7 ?", kind: "evil", dur: 900, at: 900 }
      ]
    },
    {
      title: "Le commutateur s'est comporté comme un hub.",
      text: "L'attaquant reçoit <b>tout le trafic du VLAN</b>, y compris celui qui ne lui est pas destiné. Il n'a rien cassé : il a poussé à leur limite deux mécanismes parfaitement normaux, l'apprentissage et l'inondation.",
      tone: "evil",
      set: { nodes: { atk: "pwn", sw: "evil", pca: "dead", srv: "dead" }, links: { lx: "s-evil" }, badges: { atk: "écoute tout" } },
      packets: [
        { link: "lx", dir: -1, label: "trafic A -> B7", kind: "evil", dur: 1100, at: 0 },
        { link: "lx", dir: -1, label: "trafic B7 -> A", kind: "evil", dur: 1100, at: 500 }
      ]
    },
    {
      title: "La parade — MAC locking / port security.",
      text: "Ce n'est pas un correctif mais une <b>configuration</b> : on limite le nombre d'@MAC apprises par port (souvent 1 ou 2), et au-delà on <b>ferme le port</b> (<i>err-disable</i>) ou on lève une alerte. Voir le chapitre 17.",
      tone: "ok",
      set: { nodes: { sw: "ok", atk: "dead" }, links: { lx: "s-cut", la: "s-on", ls: "s-on" }, badges: { sw: "max 2 @MAC / port", atk: "" } },
      panel: [{ t: "port  3 -> ..A1", s: "ok" }, { t: "port 24 -> ..B7", s: "ok" }, { t: "port 12 -> ERR-DISABLE", s: "warn" }, "", "3 / 8192 entrées"]
    }
  ]
};

/* ===================================================================
   Ch. 15 — Attaque 1 : reset en configuration d'usine.
   =================================================================== */
window.SCENES["vlan-reset"] = {
  title: "Attaque 1 — reset physique en configuration d'usine",
  w: 980, h: 350,
  nodes: [
    { id: "atk", x: 25, y: 140, w: 150, h: 82, kind: "attacker", label: "Attaquant", sub: ["dans le local technique"] },
    { id: "sw", x: 290, y: 130, w: 185, h: 100, kind: "switch", label: "Commutateur", sub: ["24 ports manageable", "3 VLANs configurés"] },
    { id: "rh", x: 560, y: 25, w: 150, h: 82, kind: "host", label: "Poste RH", sub: ["VLAN 10"] },
    { id: "inv", x: 560, y: 134, w: 150, h: 82, kind: "host", label: "Poste invité", sub: ["VLAN 30"] },
    { id: "rd", x: 560, y: 243, w: 150, h: 82, kind: "server", label: "Serveur R&D", sub: ["VLAN 40"] }
  ],
  links: [
    { id: "lx", from: "atk", to: "sw", kind: "off", label: "accès à la baie" },
    { id: "l10", from: "sw", to: "rh", label: "VLAN 10" },
    { id: "l30", from: "sw", to: "inv", label: "VLAN 30" },
    { id: "l40", from: "sw", to: "rd", label: "VLAN 40" }
  ],
  panel: { x: 745, y: 60, w: 210, h: 230, title: "Configuration du switch", rows: [] },
  steps: [
    {
      title: "L'état normal.",
      text: "Trois VLANs, donc <b>trois domaines de diffusion étanches</b>. Le poste invité ne peut pas joindre le serveur R&D : il faudrait passer par un routeur ou un MLS, avec des règles de pare-feu explicites.",
      set: { links: { l10: "s-ok", l30: "s-ok", l40: "s-ok" } },
      panel: [{ t: "port  1-8  : VLAN 10", s: "ok" }, { t: "port  9-16 : VLAN 30", s: "ok" }, { t: "port 17-24 : VLAN 40", s: "ok" }, "", "mot de passe enable : OK", "config sauvegardée"],
      packets: [{ path: ["inv", "sw"], label: "vers R&D", kind: "ghost", dur: 1000 }]
    },
    {
      title: "L'accès physique.",
      text: "L'attaquant entre dans le local technique. La baie de brassage n'est pas fermée à clé — ou la clé est sur le dessus. <b>Aucune configuration ne résiste à un accès physique.</b>",
      tone: "warn",
      set: { nodes: { atk: "evil" }, links: { l10: "s-ok", l30: "s-ok", l40: "s-ok", lx: "s-evil" } },
      packets: [{ link: "lx", label: "accès baie", kind: "evil", dur: 1000 }]
    },
    {
      title: "Le bouton reset.",
      text: "Il maintient le bouton <b>reset</b> quelques secondes. Aucun mot de passe n'est demandé : le reset matériel est justement là pour se sortir d'un équipement dont on a perdu les accès.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw: "warn" }, links: { lx: "s-evil" } },
      panel: [{ t: "RESET maintenu 10 s", s: "warn" }, "", "effacement de la NVRAM...", "redémarrage..."],
      packets: [{ link: "lx", label: "RESET 10 s", kind: "evil", dur: 1200 }]
    },
    {
      title: "Retour en configuration d'usine.",
      text: "L'équipement redémarre avec la configuration de sortie de carton : <b>tous les ports dans le VLAN 1</b>, aucun mot de passe, DTP actif. Toute la segmentation a disparu d'un coup.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw: "evil" }, links: { lx: "s-evil", l10: "s-evil", l30: "s-evil", l40: "s-evil" }, badges: { sw: "config usine" } },
      panel: [{ t: "port  1-24 : VLAN 1", s: "evil" }, "", { t: "mot de passe : AUCUN", s: "evil" }, { t: "DTP          : actif", s: "evil" }, { t: "3 VLANs      : effacés", s: "evil" }]
    },
    {
      title: "Un seul domaine de diffusion.",
      text: "Le poste invité et le serveur R&D sont désormais dans le <b>même VLAN</b>. Plus rien ne les sépare : ni règle de pare-feu, ni routeur, ni ACL. L'attaquant peut aussi simplement écouter les diffusions de tout le monde.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw: "evil", rd: "pwn" }, links: { lx: "s-evil", l10: "s-evil", l30: "s-evil", l40: "s-evil" } },
      packets: [
        { path: ["inv", "sw", "rd"], labels: ["vers R&D", "vers R&D"], kind: "evil", dur: 1500, at: 0 },
        { path: ["rd", "sw", "inv"], labels: ["réponse", "réponse"], kind: "evil", dur: 1500, at: 900 }
      ]
    },
    {
      title: "La parade — la sécurité physique.",
      text: "Fermeture à clé des locaux techniques et des baies, <b>contrôle d'accès</b> badgé, <b>journalisation des entrées</b>, voire détection d'ouverture de porte. C'est aussi la raison pour laquelle on sauvegarde les configurations ailleurs que sur l'équipement.",
      tone: "ok",
      set: { nodes: { atk: "dead", sw: "ok" }, links: { lx: "s-cut", l10: "s-ok", l30: "s-ok", l40: "s-ok" }, badges: { sw: "baie verrouillée" } },
      panel: [{ t: "port  1-8  : VLAN 10", s: "ok" }, { t: "port  9-16 : VLAN 30", s: "ok" }, { t: "port 17-24 : VLAN 40", s: "ok" }, "", "config restaurée depuis", "la sauvegarde"]
    }
  ]
};

/* ===================================================================
   Ch. 15 — Attaque 2 : négociation DTP (switch spoofing).
   =================================================================== */
window.SCENES["vlan-dtp"] = {
  title: "Attaque 2 — négociation DTP (switch spoofing)",
  w: 1000, h: 350,
  nodes: [
    { id: "atk", x: 25, y: 140, w: 150, h: 84, kind: "attacker", label: "Attaquant", sub: ["un PC banal", "sur le port 12"] },
    { id: "sw", x: 290, y: 130, w: 190, h: 104, kind: "switch", label: "Commutateur", sub: ["port 12 : dynamic auto", "DTP actif d'usine"] },
    { id: "v10", x: 570, y: 25, w: 150, h: 82, kind: "host", label: "Poste RH", sub: ["VLAN 10"] },
    { id: "v30", x: 570, y: 134, w: 150, h: 82, kind: "host", label: "Compta", sub: ["VLAN 30"] },
    { id: "v40", x: 570, y: 243, w: 150, h: 82, kind: "server", label: "Serveur R&D", sub: ["VLAN 40"] }
  ],
  links: [
    { id: "l12", from: "atk", to: "sw", label: "port 12" },
    { id: "l10", from: "sw", to: "v10", label: "VLAN 10" },
    { id: "l30", from: "sw", to: "v30", label: "VLAN 30" },
    { id: "l40", from: "sw", to: "v40", label: "VLAN 40" }
  ],
  panel: { x: 770, y: 70, w: 205, h: 200, title: "État du port 12", rows: [] },
  steps: [
    {
      title: "Le port sort de carton.",
      text: "<b>DTP</b> (<i>Dynamic Trunking Protocol</i>, propriétaire Cisco) sert à ce que deux commutateurs négocient tout seuls l'établissement d'un trunk. Sur beaucoup d'équipements, il est <b>actif par défaut</b> — y compris sur des ports où l'on branche des postes.",
      tone: "warn",
      set: { nodes: { sw: "warn" }, links: { l12: "s-warn", l10: "s-ok", l30: "s-ok", l40: "s-ok" } },
      panel: [{ t: "mode   : dynamic auto", s: "warn" }, "VLAN   : 30 (accès)", "trames : non taguées", "", "DTP    : actif"]
    },
    {
      title: "L'attaquant se branche.",
      text: "Rien de spécial : une prise murale libre, ou celle d'un poste qu'il a débranché. Pour l'instant il n'émet que du trafic ordinaire et ne voit que le <b>VLAN 30</b>.",
      set: { nodes: { sw: "warn", atk: "evil" }, links: { l12: "s-warn", l10: "s-ok", l30: "s-ok", l40: "s-ok" } },
      packets: [{ link: "l12", label: "trafic normal", kind: "data", dur: 900 }]
    },
    {
      title: "Il forge des trames DTP.",
      text: "Avec <b>Yersinia</b> ou quelques lignes de Scapy, il envoie une trame DTP <code>desirable</code> : « <i>bonjour, je suis un commutateur, montons un trunk</i> ». Rien, dans DTP, ne l'oblige à le prouver.",
      tone: "evil",
      set: { nodes: { sw: "warn", atk: "evil" }, links: { l12: "s-evil", l10: "s-ok", l30: "s-ok", l40: "s-ok" } },
      packets: [
        { link: "l12", label: "DTP desirable", kind: "evil", dur: 900, at: 0 },
        { link: "l12", dir: -1, label: "DTP accord", kind: "ctrl", dur: 900, at: 1000 }
      ]
    },
    {
      title: "Le commutateur bascule le port en trunk.",
      text: "Il croit dialoguer avec un autre commutateur. Le port 12 n'est plus un port d'accès : il devient un <b>trunk 802.1Q</b> qui transporte <b>tous</b> les VLANs, tagués.",
      tone: "evil",
      set: { nodes: { sw: "evil", atk: "evil" }, links: { l12: "s-evil", l10: "s-ok", l30: "s-ok", l40: "s-ok" }, badges: { sw: "port 12 = TRUNK" } },
      panel: [{ t: "mode   : TRUNK 802.1Q", s: "evil" }, { t: "VLAN   : 1, 10, 30, 40", s: "evil" }, { t: "trames : taguées", s: "evil" }, "", "la segmentation est", "contournée"]
    },
    {
      title: "Tous les VLANs arrivent chez lui.",
      text: "L'attaquant reçoit le trafic de la RH, de la compta et de la R&D, chaque trame portant son <b>identifiant de VLAN</b>. Il lui suffit de créer les interfaces virtuelles correspondantes pour être présent dans chacun d'eux.",
      tone: "evil",
      set: { nodes: { sw: "evil", atk: "pwn" }, links: { l12: "s-evil", l10: "s-warn", l30: "s-warn", l40: "s-warn" }, badges: { atk: "membre de tous les VLANs" } },
      packets: [
        { path: ["v10", "sw", "atk"], labels: ["trafic RH", "[VID 10] trafic RH"], kind: "evil", dur: 1600, at: 0 },
        { path: ["v30", "sw", "atk"], labels: ["trafic compta", "[VID 30] compta"], kind: "evil", dur: 1600, at: 400 },
        { path: ["v40", "sw", "atk"], labels: ["trafic R&D", "[VID 40] R&D"], kind: "evil", dur: 1600, at: 800 }
      ]
    },
    {
      title: "La parade — deux lignes de configuration.",
      text: "On ne laisse jamais un port d'accès négocier : <code>switchport mode access</code> le fige en port d'accès, <code>switchport nonegotiate</code> coupe DTP. À faire sur <b>tous</b> les ports utilisateurs, pas seulement sur celui qu'on a testé.",
      tone: "ok",
      set: { nodes: { sw: "ok", atk: "dead" }, links: { l12: "s-cut", l10: "s-ok", l30: "s-ok", l40: "s-ok" }, badges: { sw: "DTP désactivé", atk: "" } },
      panel: [{ t: "mode   : access (forcé)", s: "ok" }, { t: "DTP    : nonegotiate", s: "ok" }, { t: "VLAN   : 30 seulement", s: "ok" }]
    }
  ]
};

/* ===================================================================
   Ch. 15 — Attaque 3 : double étiquetage (VLAN hopping).
   =================================================================== */
window.SCENES["vlan-double-tag"] = {
  title: "Attaque 3 — double tagging (VLAN hopping)",
  w: 1000, h: 380,
  nodes: [
    { id: "atk", x: 25, y: 110, w: 150, h: 92, kind: "attacker", label: "Attaquant", sub: ["port d'accès", "dans le VLAN 1"] },
    { id: "sw1", x: 265, y: 110, w: 165, h: 92, kind: "switch", label: "Switch 1", sub: ["trunk 802.1Q", "natif = VLAN 1"] },
    { id: "sw2", x: 560, y: 110, w: 165, h: 92, kind: "switch", label: "Switch 2", sub: ["VLAN 40 sur port 8"] },
    { id: "vic", x: 830, y: 110, w: 150, h: 92, kind: "server", label: "Serveur R&D", sub: ["VLAN 40", "la cible"] }
  ],
  links: [
    { id: "la", from: "atk", to: "sw1", label: "accès VLAN 1" },
    { id: "lt", from: "sw1", to: "sw2", kind: "trunk", label: "trunk · natif = 1" },
    { id: "lv", from: "sw2", to: "vic", label: "accès VLAN 40" }
  ],
  panel: { x: 25, y: 250, w: 950, h: 100, title: "La trame, à cet instant précis", rows: [] },
  steps: [
    {
      title: "La condition de l'attaque.",
      text: "Deux commutateurs reliés par un <b>trunk</b>. Sur un trunk, un VLAN — le <b>VLAN natif</b> — circule <b>sans étiquette</b> ; par défaut c'est le VLAN 1, et c'est aussi celui de l'attaquant. Toute l'attaque tient dans cette coïncidence.",
      tone: "warn",
      set: { links: { la: "s-on", lt: "s-warn", lv: "s-on" } },
      panel: ["(aucune trame en vol)"]
    },
    {
      title: "La trame à deux étiquettes.",
      text: "L'attaquant forge lui-même sa trame et y empile <b>deux tags 802.1Q</b> : le tag <b>externe</b> porte le VLAN 1 (le natif), le tag <b>interne</b> porte le VLAN 40 (la cible). Un poste normal ne fait jamais ça — mais rien ne l'interdit.",
      tone: "evil",
      set: { nodes: { atk: "evil" }, links: { la: "s-evil", lt: "s-warn", lv: "s-on" } },
      panel: [{ t: "DST | SRC | 8100 VID=1 | 8100 VID=40 | données", s: "evil" }, "        ^ externe = natif   ^ interne = cible"],
      packets: [{ link: "la", label: "[1][40] data", kind: "evil", dur: 1100 }]
    },
    {
      title: "Switch 1 retire le tag externe.",
      text: "Il lit le premier tag : <b>VID 1</b>, c'est son VLAN natif. Or le natif voyage sans étiquette sur le trunk. Il <b>enlève donc ce tag</b> et transmet — <b>sans jamais regarder ce qu'il y a en dessous</b>. C'est le cœur de la faille : le commutateur ne dépile qu'un seul niveau.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw1: "warn" }, links: { la: "s-evil", lt: "s-evil", lv: "s-on" } },
      panel: [{ t: "DST | SRC | 8100 VID=40 | données", s: "evil" }, "        ^ il ne reste qu'un tag — celui de la cible"],
      packets: [{ link: "lt", label: "[40] data", kind: "evil", dur: 1200 }]
    },
    {
      title: "Switch 2 lit le tag restant.",
      text: "Il reçoit une trame étiquetée <b>VLAN 40</b> sur un trunk. Rien, absolument rien, ne lui indique qu'elle vient d'un poste du VLAN 1. Il fait son travail : il la délivre dans le VLAN 40.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw1: "warn", sw2: "evil" }, links: { la: "s-evil", lt: "s-evil", lv: "s-evil" } },
      panel: [{ t: "DST | SRC | données          (tag retiré en sortie)", s: "evil" }, "        le port 8 est un port d'accès : il détague"],
      packets: [{ link: "lv", label: "data -> VLAN 40", kind: "evil", dur: 1100 }]
    },
    {
      title: "L'injection a réussi.",
      text: "L'attaquant a fait entrer une trame dans un VLAN auquel il n'a <b>aucun droit d'accès</b>. Il a sauté par-dessus la segmentation sans toucher au commutateur ni à sa configuration.",
      tone: "evil",
      set: { nodes: { atk: "evil", sw1: "warn", sw2: "evil", vic: "pwn" }, links: { la: "s-evil", lt: "s-evil", lv: "s-evil" }, badges: { vic: "trame reçue" } },
      panel: [{ t: "le serveur R&D a traité une trame venue du VLAN 1", s: "evil" }]
    },
    {
      title: "Mais rien ne revient.",
      text: "L'attaque est <b>unidirectionnelle</b>. La réponse du serveur est une trame ordinaire du VLAN 40 : elle ne sera jamais délivrée dans le VLAN 1. C'est de l'<b>injection aveugle</b> — utile pour un déni de service ou une commande, inutile pour lire des données.",
      tone: "warn",
      set: { nodes: { atk: "evil", sw2: "evil", vic: "evil" }, links: { la: "s-cut", lt: "s-cut", lv: "s-warn" } },
      panel: [{ t: "réponse : VLAN 40 -> VLAN 40   (jamais reçue par l'attaquant)", s: "gone" }],
      packets: [
        { link: "lv", dir: -1, label: "réponse", kind: "ghost", dur: 900, at: 0 },
        { link: "lt", dir: -1, label: "jetée", kind: "ghost", dur: 700, at: 900 }
      ]
    },
    {
      title: "La parade — trois mesures cumulatives.",
      text: "<b>1.</b> Ne jamais utiliser le VLAN 1 pour du trafic de production. <b>2.</b> Changer l'ID du VLAN natif des trunks pour un VLAN <b>dédié et inutilisé</b> (999, par exemple). <b>3.</b> Forcer le taguage du natif avec <code>vlan dot1q tag native</code> : plus aucune trame ne circule sans étiquette, l'attaque n'a plus de prise.",
      tone: "ok",
      set: { nodes: { sw1: "ok", sw2: "ok", atk: "dead" }, links: { la: "s-cut", lt: "s-ok", lv: "s-ok" }, badges: { sw1: "natif = 999, tagué", vic: "" } },
      panel: [{ t: "trunk : toutes les trames sont taguées, natif compris", s: "ok" }, { t: "une trame à deux tags est rejetée dès le premier switch", s: "ok" }]
    }
  ]
};

/* ===================================================================
   Ch. 27.4 — SYN stealth scan : la furtivité vient de l'étage où
   l'on s'arrête, pas d'un chiffrement.
   =================================================================== */
window.SCENES["syn-scan"] = {
  title: "SYN stealth scan — s'arrêter avant de réveiller l'application",
  w: 960, h: 360,
  nodes: [
    { id: "atk", x: 25, y: 130, w: 165, h: 92, kind: "attacker", label: "Attaquant", sub: ["nmap -sS", "privilèges root"] },
    { id: "fw", x: 300, y: 130, w: 160, h: 92, kind: "firewall", label: "Pare-feu / NIDS", sub: ["couches 3 et 4"] },
    { id: "srv", x: 570, y: 130, w: 170, h: 92, kind: "server", label: "Serveur", sub: ["pile TCP du noyau"] },
    { id: "app", x: 570, y: 15, w: 170, h: 92, kind: "host", label: "Apache", sub: ["l'application", "réveillée au 3e paquet"] }
  ],
  links: [
    { id: "l1", from: "atk", to: "fw", label: "Internet" },
    { id: "l2", from: "fw", to: "srv", label: "443/tcp" },
    { id: "l3", from: "srv", to: "app", kind: "off", label: "socket" }
  ],
  panel: { x: 765, y: 130, w: 190, h: 190, title: "Réponse au SYN", rows: [] },
  steps: [
    {
      title: "Ce que le scan cherche.",
      text: "Savoir quels ports répondent, <b>sans laisser de trace dans les journaux applicatifs</b>. La clé est un détail de TCP : un serveur comme Apache n'est réveillé — <code>fork()</code>, journalisation — qu'une fois le <b>troisième</b> paquet du handshake reçu.",
      set: { links: { l3: "s-cut" }, nodes: { app: "dead" } },
      panel: ["(scan non lancé)"]
    },
    {
      title: "1 — SYN.",
      text: "L'attaquant envoie un unique segment <code>SYN=1, ACK=0</code> vers le port 443. Il traverse le pare-feu et arrive à la <b>pile TCP du noyau</b> du serveur.",
      set: { nodes: { atk: "evil", app: "dead" }, links: { l1: "s-evil", l2: "s-evil", l3: "s-cut" } },
      packets: [{ path: ["atk", "fw", "srv"], labels: ["SYN", "SYN"], kind: "evil", dur: 1400 }]
    },
    {
      title: "2 — SYN+ACK.",
      text: "Le <b>noyau</b> répond tout seul <code>SYN=1, ACK=1</code>. C'est déjà l'information recherchée : le port est ouvert. L'application, elle, <b>n'a rien vu</b> — elle n'a même pas été appelée.",
      set: { nodes: { atk: "evil", srv: "active", app: "dead" }, links: { l1: "s-on", l2: "s-on", l3: "s-cut" } },
      panel: [{ t: "SYN+ACK -> port OUVERT", s: "ok" }],
      packets: [{ path: ["srv", "fw", "atk"], labels: ["SYN+ACK", "SYN+ACK"], kind: "data", dur: 1400 }]
    },
    {
      title: "3 — RST au lieu de l'ACK.",
      text: "Au lieu du troisième paquet attendu, l'attaquant envoie un <code>RST</code> et coupe. La connexion <b>n'a jamais été établie</b> ; <code>fork()</code> n'a pas eu lieu ; rien n'apparaît dans les journaux d'Apache.",
      tone: "evil",
      set: { nodes: { atk: "evil", srv: "evil", app: "dead" }, links: { l1: "s-evil", l2: "s-evil", l3: "s-cut" }, badges: { app: "aucun log" } },
      packets: [{ path: ["atk", "fw", "srv"], labels: ["RST", "RST"], kind: "evil", dur: 1400 }]
    },
    {
      title: "Les quatre réponses possibles.",
      text: "Un <code>RST</code> immédiat signifie que le port est <b>fermé</b> — mais que la machine est bien <b>vivante</b>, ce qui est déjà une information. Le <b>silence</b> signifie <b>filtré</b> : un pare-feu jette sans rien dire. Un <code>ICMP 3/13</code> signifie filtré <b>et annoncé</b>.",
      set: { nodes: { atk: "evil", app: "dead" }, links: { l3: "s-cut" } },
      panel: [{ t: "SYN+ACK   -> OUVERT", s: "ok" }, { t: "RST       -> FERMÉ", s: "warn" }, { t: "(silence) -> FILTRÉ", s: "evil" }, { t: "ICMP 3/13 -> filtré,", s: "evil" }, { t: "             et annoncé", s: "evil" }]
    },
    {
      title: "Ce qui le détecte quand même.",
      text: "Le <b>pare-feu</b> et le <b>NIDS</b> travaillent au niveau des <b>paquets</b>, pas de l'application. Une rafale de <code>SYN</code> suivis de <code>RST</code> sur mille ports en deux secondes est un motif parfaitement lisible pour eux. La furtivité est applicative, pas réseau.",
      tone: "ok",
      set: { nodes: { fw: "ok", atk: "evil", app: "dead" }, links: { l1: "s-warn", l3: "s-cut" }, badges: { fw: "SYN/RST x 1000 détectés" } },
      packets: [
        { link: "l1", label: "SYN", kind: "evil", dur: 600, at: 0 },
        { link: "l1", label: "SYN", kind: "evil", dur: 600, at: 200 },
        { link: "l1", label: "SYN", kind: "evil", dur: 600, at: 400 },
        { link: "l1", label: "SYN", kind: "evil", dur: 600, at: 600 }
      ]
    },
    {
      title: "La nuance à connaître.",
      text: "<code>nmap -sT</code> (<i>connect scan</i>) fait le handshake <b>complet</b> : il n'a pas besoin des privilèges root, mais il est <b>tracé partout</b>, y compris dans les journaux applicatifs. C'est exactement pour cela qu'on lui préfère <code>-sS</code> quand on les a.",
      set: { nodes: { app: "warn", atk: "evil" }, links: { l3: "s-warn" }, badges: { app: "-sT : loggé ici" } },
      packets: [{ path: ["srv", "app"], label: "fork() + log", kind: "warn", dur: 900 }]
    }
  ]
};

/* ===================================================================
   Ch. 29.3 — Empoisonnement de cache DNS : la course contre la
   vraie réponse.
   =================================================================== */
window.SCENES["dns-poisoning"] = {
  title: "Empoisonnement de cache DNS — gagner la course",
  w: 1000, h: 370,
  nodes: [
    { id: "pc", x: 25, y: 150, w: 155, h: 88, kind: "host", label: "Poste client", sub: ["veut google.com"] },
    { id: "res", x: 250, y: 150, w: 175, h: 88, kind: "server", label: "Résolveur", sub: ["serveur de l'entreprise", "cache vide"] },
    { id: "root", x: 545, y: 30, w: 160, h: 88, kind: "cloud", label: "Racine + TLD", sub: [". puis .com"] },
    { id: "auth", x: 800, y: 30, w: 170, h: 88, kind: "server", label: "Autoritaire", sub: ["ns1.google.com"] },
    { id: "atk", x: 545, y: 255, w: 165, h: 88, kind: "attacker", label: "Attaquant", sub: ["sur le réseau", "Scapy, en UDP"] }
  ],
  links: [
    { id: "lpc", from: "pc", to: "res", label: "53/udp" },
    { id: "lr", from: "res", to: "root", label: "récursion" },
    { id: "la", from: "root", to: "auth", label: "délégation" },
    { id: "lx", from: "atk", to: "res", kind: "off", label: "réponse forgée" }
  ],
  panel: { x: 25, y: 262, w: 470, h: 90, title: "Cache du résolveur", rows: [] },
  steps: [
    {
      title: "La requête légitime.",
      text: "Le poste demande <code>google.com</code> à son résolveur d'entreprise. Rien d'anormal : c'est le fonctionnement quotidien.",
      set: { nodes: { pc: "active", res: "active" }, links: { lpc: "s-on" } },
      panel: ["(cache vide — le TTL vient d'expirer)"],
      packets: [{ link: "lpc", label: "google.com ?", kind: "data", dur: 900 }]
    },
    {
      title: "Le cache est vide.",
      text: "Le résolveur ne connaît pas la réponse. Il part la chercher <b>en récursif</b> : la racine, puis le serveur de <code>.com</code>, puis le serveur autoritaire de <code>google.com</code>.",
      set: { nodes: { pc: "active", res: "active", root: "active" }, links: { lpc: "s-on", lr: "s-on", la: "s-on" } },
      panel: ["(cache vide — interrogation en cours)"],
      packets: [
        { link: "lr", label: "google.com ?", kind: "data", dur: 1000, at: 0 },
        { link: "la", label: "google.com ?", kind: "data", dur: 1000, at: 900 }
      ]
    },
    {
      title: "La fenêtre s'ouvre.",
      text: "Pendant cette attente, le cache est <b>en écriture</b> : le résolveur a posé une question et accepte <b>la première réponse qui y correspond</b>. Il n'a aucun moyen de vérifier d'où elle vient — le DNS d'origine ne prévoit <b>aucune authentification</b>.",
      tone: "warn",
      set: { nodes: { res: "warn", root: "active" }, links: { lr: "s-warn", la: "s-warn" }, badges: { res: "en attente d'une réponse" } },
      panel: [{ t: "(fenêtre ouverte : première réponse acceptée)", s: "warn" }]
    },
    {
      title: "L'injection.",
      text: "L'attaquant, présent sur le réseau, forge en <b>UDP</b> une réponse qui se fait passer pour le serveur interrogé : « <code>google.com</code> = <code>5.5.5.5</code> », avec un <b>TTL très long</b>. UDP est sans état : il n'y a rien à détourner, juste un paquet à fabriquer.",
      tone: "evil",
      set: { nodes: { res: "warn", atk: "evil" }, links: { lx: "s-evil", lr: "s-warn", la: "s-warn" } },
      panel: [{ t: "(fenêtre ouverte : première réponse acceptée)", s: "warn" }],
      packets: [{ link: "lx", label: "google.com = 5.5.5.5", kind: "evil", dur: 1200 }]
    },
    {
      title: "Elle arrive avant la vraie.",
      text: "Le résolveur enregistre. Quand la <b>vraie</b> réponse arrive quelques millisecondes plus tard, elle est jetée comme un doublon : la question a déjà trouvé preneur.",
      tone: "evil",
      set: { nodes: { res: "evil", atk: "evil" }, links: { lx: "s-evil", lr: "s-cut", la: "s-cut" }, badges: { res: "cache empoisonné" } },
      panel: [{ t: "google.com  A  5.5.5.5  TTL 86400", s: "evil" }, { t: "(réponse authentique arrivée trop tard : jetée)", s: "gone" }],
      packets: [{ link: "la", dir: -1, label: "142.250.75.238", kind: "ghost", dur: 1100 }]
    },
    {
      title: "Tout le réseau est empoisonné.",
      text: "Le résolveur répond au poste, puis sert la <b>même fausse réponse à tous ses clients</b> pendant toute la durée du TTL. Une seule injection réussie contamine l'entreprise entière — c'est ce qui distingue l'empoisonnement d'un simple détournement individuel.",
      tone: "evil",
      set: { nodes: { res: "evil", pc: "pwn", atk: "evil" }, links: { lpc: "s-evil", lx: "s-evil" }, badges: { pc: "va sur 5.5.5.5" } },
      panel: [{ t: "google.com  A  5.5.5.5  TTL 86400", s: "evil" }, { t: "servie à tous les postes du réseau", s: "evil" }],
      packets: [
        { link: "lpc", dir: -1, label: "5.5.5.5", kind: "evil", dur: 900, at: 0 },
        { link: "lpc", label: "GET / vers 5.5.5.5", kind: "evil", dur: 900, at: 800 }
      ]
    },
    {
      title: "La vraie difficulté pour l'attaquant.",
      text: "Elle n'est pas technique mais temporelle : il faut tomber sur l'<b>instant précis</b> où l'entrée n'est plus en cache et où la question est repartie. La réponse pratique donnée en cours : « <b>essayer en permanence</b> ». Tôt ou tard, la fenêtre s'ouvre.",
      tone: "warn",
      set: { nodes: { res: "evil", atk: "evil" }, links: { lx: "s-evil" } },
      packets: [
        { link: "lx", label: "tentative", kind: "evil", dur: 600, at: 0 },
        { link: "lx", label: "tentative", kind: "ghost", dur: 600, at: 250 },
        { link: "lx", label: "tentative", kind: "ghost", dur: 600, at: 500 },
        { link: "lx", label: "tentative", kind: "ghost", dur: 600, at: 750 }
      ]
    },
    {
      title: "La parade — DNSSEC.",
      text: "Le problème n'est pas l'absence de <b>chiffrement</b> — l'attaquant n'a pas besoin d'écouter — mais l'absence d'<b>authenticité</b>. DNSSEC signe cryptographiquement les enregistrements : le résolveur peut enfin vérifier l'origine et l'intégrité de ce qu'il reçoit. S'y ajoutent l'aléa du <b>port source</b> et du <b>transaction ID</b>, qui rendent la course beaucoup plus dure à gagner.",
      tone: "ok",
      set: { nodes: { res: "ok", atk: "dead" }, links: { lx: "s-cut", lr: "s-ok", la: "s-ok", lpc: "s-ok" }, badges: { res: "vérifie les signatures", pc: "" } },
      panel: [{ t: "google.com  A  142.250.75.238  [RRSIG vérifiée]", s: "ok" }, { t: "réponse non signée -> rejetée", s: "ok" }]
    }
  ]
};

/* ===================================================================
   Ch. 30.3 — L'homme du milieu : le pirate et le pare-feu font
   exactement la même chose. Seul le magasin de confiance diffère.
   =================================================================== */
window.SCENES["tls-mitm"] = {
  kind: "Attaque",
  title: "L'homme du milieu — pirate ou pare-feu, le même geste",
  w: 960, h: 400,
  nodes: [
    { id: "store", x: 25, y: 25, w: 170, h: 88, kind: "lock", label: "Magasin de confiance", sub: ["du poste"] },
    { id: "pc", x: 25, y: 165, w: 170, h: 88, kind: "host", label: "Poste", sub: ["navigateur"] },
    { id: "box", x: 330, y: 160, w: 210, h: 98, kind: "firewall", label: "L'équipement au milieu", sub: ["déchiffre, lit, rechiffre"] },
    { id: "bank", x: 690, y: 165, w: 175, h: 88, kind: "server", label: "banque.fr", sub: ["certificat authentique"] }
  ],
  links: [
    { id: "ls", from: "store", to: "pc", kind: "off", label: "autorités reconnues" },
    { id: "lc", from: "pc", to: "box", label: "TLS n°1" },
    { id: "lo", from: "box", to: "bank", label: "TLS n°2" }
  ],
  panel: { x: 25, y: 290, w: 910, h: 95, title: "Ce qui se passe réellement", rows: [] },
  steps: [
    {
      title: "Le principe, commun aux deux cas.",
      text: "Un équipement s'intercale. Il <b>termine</b> la session TLS côté client, en <b>ouvre une autre</b> côté serveur, et voit donc <b>tout en clair au milieu</b>. Techniquement, le pirate du Wi-Fi d'hôtel et le pare-feu de l'entreprise font exactement le même geste.",
      set: { nodes: { box: "warn" }, links: { lc: "s-warn", lo: "s-warn" } },
      panel: ["session 1 : poste  <->  équipement", "session 2 : équipement  <->  banque.fr", { t: "en clair au milieu : TOUT", s: "warn" }],
      packets: [
        { path: ["pc", "box"], label: "ClientHello", kind: "data", dur: 900, at: 0 },
        { path: ["box", "bank"], label: "ClientHello", kind: "data", dur: 900, at: 800 }
      ]
    },
    {
      title: "Cas 1 — l'attaquant du Wi-Fi d'hôtel.",
      text: "Il ne peut pas fabriquer un certificat valide pour <code>banque.fr</code> : il faudrait la clé privée de la banque, ou la complicité d'une autorité. Il présente donc un certificat <b>auto-signé</b>, ou signé par une autorité qu'il a créée lui-même.",
      tone: "evil",
      set: { nodes: { box: "evil" }, links: { lc: "s-evil", lo: "s-warn" }, badges: { box: "certificat auto-signé" } },
      panel: [{ t: "certificat présenté : émetteur inconnu", s: "evil" }],
      packets: [{ path: ["box", "pc"], label: "cert. signé par ???", kind: "evil", dur: 1000 }]
    },
    {
      title: "Le magasin ne connaît pas cette autorité.",
      text: "Le navigateur remonte la chaîne de confiance et n'arrive nulle part. Il affiche un <b>avertissement</b> — que l'utilisateur peut malheureusement contourner.",
      tone: "evil",
      set: { nodes: { box: "evil", store: "evil", pc: "warn" }, links: { lc: "s-evil", ls: "s-evil" } },
      panel: [{ t: "magasin  : autorité INCONNUE", s: "evil" }, { t: "cadenas  : ROUGE, avertissement affiché", s: "evil" }, { t: "l'utilisateur peut passer outre... et il le fait", s: "warn" }]
    },
    {
      title: "Cas 2 — le pare-feu de l'entreprise.",
      text: "Dans un Fortinet ou un Stormshield, la <b>deep inspection</b> est littéralement une case à cocher. Une fois activée, tout le HTTPS est déchiffré, analysé (antivirus, DLP, filtrage d'URL) puis rechiffré avec un certificat signé par l'<b>autorité racine interne</b>.",
      set: { nodes: { box: "active" }, links: { lc: "s-on", lo: "s-on" }, badges: { box: "signé par l'AC interne" } },
      panel: ["certificat présenté : émetteur = AC racine de l'entreprise"],
      packets: [{ path: ["box", "pc"], label: "cert. AC interne", kind: "ctrl", dur: 1000 }]
    },
    {
      title: "Mais cette autorité a été poussée par GPO.",
      text: "L'Active Directory a installé l'<b>AC racine interne</b> dans le magasin de confiance du poste, bien avant que l'utilisateur ouvre son navigateur. La chaîne de confiance remonte donc à une autorité que le poste <b>reconnaît</b>.",
      tone: "warn",
      set: { nodes: { box: "active", store: "ok" }, links: { lc: "s-on", ls: "s-ok" }, badges: { store: "AC interne installée par GPO" } },
      packets: [{ link: "ls", label: "AC racine interne (GPO)", kind: "ctrl", dur: 1100 }]
    },
    {
      title: "Le cadenas est vert. Aucun signe. Rien.",
      text: "C'est la question d'examen : <b>pourquoi le cadenas reste-t-il vert alors qu'un équipement déchiffre le flux ?</b> Parce que TLS fonctionne <b>exactement comme prévu</b> — la chaîne est valide. Ce n'est pas TLS qui a été cassé, c'est le <b>magasin de confiance</b> qui a été modifié.",
      tone: "evil",
      set: { nodes: { box: "active", store: "ok", pc: "ok", bank: "active" }, links: { lc: "s-ok", lo: "s-ok", ls: "s-ok" } },
      panel: [{ t: "magasin  : AC interne PRÉSENTE", s: "ok" }, { t: "cadenas  : VERT, aucun avertissement", s: "ok" }, { t: "et pourtant l'employeur lit, stocke et archive le clair", s: "evil" }]
    },
    {
      title: "La seule façon de s'en apercevoir.",
      text: "Ouvrir le certificat et <b>lire l'émetteur</b> : il porte le nom de <b>votre entreprise</b>, pas celui de la banque. Rien d'autre dans l'interface ne le trahit.",
      tone: "warn",
      set: { nodes: { box: "warn", store: "ok" }, links: { lc: "s-warn", lo: "s-warn" }, badges: { box: "émetteur = votre employeur" } },
      panel: [{ t: "émetteur du certificat : \"ACME Corp Internal CA\"  <- le signe", s: "warn" }]
    },
    {
      title: "Ce que cela coûte, et ce qui l'a remplacé.",
      text: "L'employeur détient en clair <b>toute</b> la navigation, y compris bancaire et médicale : en France cela impose une information écrite des salariés, et l'on exclut techniquement les catégories « banque » et « santé ». Les <b>EDR</b> ne font plus cela : installés <b>sur</b> la machine, ils lisent le clair en mémoire, avant chiffrement ou après déchiffrement, sans casser TLS.",
      tone: "ok",
      set: { nodes: { box: "ok", store: "ok", pc: "ok", bank: "ok" }, links: { lc: "s-ok", lo: "s-ok", ls: "s-ok" }, badges: { box: "" } },
      panel: [{ t: "exclusions obligatoires : catégories banque et santé", s: "ok" }, { t: "EDR : lecture en mémoire, TLS intact", s: "ok" }]
    }
  ]
};

/* ===================================================================
   Ch. 30.5 — CheckMyHTTPS : détecter l'interception depuis
   l'extérieur de la zone hostile.
   =================================================================== */
window.SCENES["checkmyhttps"] = {
  kind: "Contrôle",
  title: "CheckMyHTTPS — faire vérifier le certificat par un témoin extérieur",
  w: 980, h: 396,
  nodes: [
    { id: "pc", x: 25, y: 120, w: 165, h: 90, kind: "host", label: "Poste + extension", sub: ["CheckMyHTTPS"] },
    { id: "box", x: 280, y: 120, w: 170, h: 90, kind: "firewall", label: "Zone hostile", sub: ["Wi-Fi public,", "frontière numérique"] },
    { id: "site", x: 545, y: 120, w: 165, h: 90, kind: "server", label: "banque.fr", sub: ["le vrai site"] },
    { id: "wit", x: 280, y: 264, w: 185, h: 90, kind: "server", label: "Serveur témoin", sub: ["hors de la zone"] }
  ],
  links: [
    { id: "l1", from: "pc", to: "box", label: "HTTPS" },
    { id: "l2", from: "box", to: "site", label: "HTTPS" },
    { id: "l3", from: "pc", to: "wit", kind: "off", label: "hors zone" },
    { id: "l4", from: "wit", to: "site", kind: "off", label: "chemin direct" }
  ],
  panel: { x: 760, y: 100, w: 200, h: 170, title: "Comparaison", rows: [] },
  steps: [
    {
      title: "Le problème.",
      text: "Depuis l'intérieur du réseau, vous <b>ne pouvez pas savoir</b> si le certificat que vous recevez est bien celui du site — puisque tout ce que vous recevez passe par l'équipement suspect. Le juge et la partie sont la même machine.",
      set: { nodes: { box: "evil" }, links: { l1: "s-evil", l2: "s-evil" } },
      panel: ["reçu      : ?", "référence : ?"]
    },
    {
      title: "1 — L'agent capture.",
      text: "Une extension de navigateur (Chrome, Firefox) ou une application Android récupère le certificat <b>effectivement reçu</b> et en calcule l'<b>empreinte</b>.",
      set: { nodes: { box: "evil", pc: "active" }, links: { l1: "s-evil", l2: "s-evil" } },
      panel: [{ t: "reçu      : 3F:A1:0C:...", s: "warn" }, "référence : ?"],
      packets: [{ path: ["site", "box", "pc"], labels: ["certificat", "certificat ???"], kinds: ["data", "evil"], dur: 1500 }]
    },
    {
      title: "2 — Le serveur témoin.",
      text: "L'agent envoie <b>seulement le nom du site</b> — jamais le contenu de votre navigation — à un serveur CheckMyHTTPS situé <b>hors de la zone hostile</b>.",
      set: { nodes: { box: "evil", pc: "active", wit: "ok" }, links: { l1: "s-evil", l2: "s-evil", l3: "s-ok" } },
      packets: [{ link: "l3", label: "banque.fr ?", kind: "ok", dur: 1100 }]
    },
    {
      title: "3 — La requête de contrôle.",
      text: "Le témoin interroge <b>lui-même</b> le site, par un chemin qui ne traverse pas l'équipement d'interception, récupère le certificat et en calcule l'empreinte.",
      set: { nodes: { box: "evil", wit: "ok", site: "ok" }, links: { l1: "s-evil", l2: "s-evil", l3: "s-ok", l4: "s-ok" } },
      panel: [{ t: "reçu      : 3F:A1:0C:...", s: "warn" }, { t: "référence : 91:7B:E4:...", s: "ok" }],
      packets: [
        { link: "l4", label: "TLS", kind: "ok", dur: 900, at: 0 },
        { link: "l4", dir: -1, label: "certificat", kind: "ok", dur: 900, at: 800 }
      ]
    },
    {
      title: "4 — La comparaison.",
      text: "Le témoin renvoie son empreinte. L'agent compare les deux — <b>localement</b>, dans le navigateur.",
      set: { nodes: { box: "evil", wit: "ok", pc: "active" }, links: { l1: "s-evil", l3: "s-ok", l4: "s-ok" } },
      packets: [{ link: "l3", dir: -1, label: "91:7B:E4:...", kind: "ok", dur: 1100 }]
    },
    {
      title: "Le verdict.",
      text: "Empreintes identiques → <b>vert</b>, personne ne s'est intercalé. Empreintes différentes → <b>rouge</b> : quelqu'un déchiffre votre trafic, que ce soit un attaquant ou l'infrastructure du pays où vous êtes.",
      tone: "evil",
      set: { nodes: { box: "evil", pc: "evil", wit: "ok" }, links: { l1: "s-evil", l3: "s-ok" }, badges: { pc: "ROUGE" } },
      panel: [{ t: "reçu      : 3F:A1:0C:...", s: "evil" }, { t: "référence : 91:7B:E4:...", s: "ok" }, "", { t: "=> ROUGE : interception", s: "evil" }]
    },
    {
      title: "La contrainte unique.",
      text: "Le serveur témoin ne doit <b>pas</b> être derrière le même équipement d'interception, sinon il se fait tromper exactement de la même façon et renvoie la même fausse empreinte. Toute la valeur du dispositif tient à ce point de vue extérieur.",
      tone: "warn",
      set: { nodes: { wit: "warn", box: "evil" }, links: { l3: "s-warn", l4: "s-warn" }, badges: { wit: "hors de la zone !" } }
    },
    {
      title: "Le parti pris, et qui l'utilise.",
      text: "« C'est vert ou ce n'est pas vert » — aucune explication de PKI à l'utilisateur : la sécurité utilisable est celle qu'on n'a pas besoin d'expliquer. Le code est <b>public</b> : <b>Thales</b> et <b>quatre ministères français</b> hébergent leur propre témoin. L'usage type : les collaborateurs en déplacement à l'étranger doivent faire un contrôle <b>avant</b> d'ouvrir leur VPN.",
      tone: "ok",
      set: { nodes: { wit: "ok", pc: "ok" }, links: { l3: "s-ok", l4: "s-ok" }, badges: { pc: "", wit: "" } }
    }
  ]
};

/* ===================================================================
   Ch. 34.2 — DHCP spoofing : celui qui répond le premier choisit la
   passerelle et le résolveur de sa victime.
   =================================================================== */
window.SCENES["dhcp-spoofing"] = {
  title: "DHCP spoofing — le serveur pirate qui répond plus vite",
  w: 1000, h: 410,
  nodes: [
    { id: "pc", x: 25, y: 155, w: 170, h: 92, kind: "host", label: "Poste au démarrage", sub: ["aucune configuration"] },
    { id: "sw", x: 290, y: 155, w: 165, h: 92, kind: "switch", label: "Commutateur", sub: ["pas de DHCP snooping"] },
    { id: "dhcp", x: 560, y: 25, w: 175, h: 92, kind: "server", label: "DHCP légitime", sub: ["Active Directory", "répond en ~40 ms"] },
    { id: "atk", x: 560, y: 250, w: 175, h: 92, kind: "attacker", label: "DHCP pirate", sub: ["Raspberry Pi", "répond en ~3 ms"] },
    { id: "net", x: 830, y: 155, w: 145, h: 92, kind: "cloud", label: "Internet" }
  ],
  links: [
    { id: "lpc", from: "pc", to: "sw", label: "port 2" },
    { id: "ld", from: "sw", to: "dhcp", label: "port 24 (baie)" },
    { id: "lx", from: "sw", to: "atk", label: "port 17" },
    { id: "ln", from: "sw", to: "net", label: "sortie" }
  ],
  panel: { x: 25, y: 305, w: 500, h: 90, title: "Configuration reçue par le poste", rows: [] },
  steps: [
    {
      title: "Le poste démarre et n'a rien.",
      text: "Ni adresse, ni masque, ni passerelle, ni résolveur. Il émet un <code>DHCP Discover</code> en <b>diffusion</b> : tout le VLAN l'entend, y compris ce qu'on n'a pas invité.",
      set: { nodes: { pc: "active" }, links: { lpc: "s-on", ld: "s-on", lx: "s-on" } },
      panel: ["(aucune configuration)"],
      packets: [
        { path: ["pc", "sw"], label: "DHCP Discover", kind: "data", dur: 800, at: 0 },
        { link: "ld", label: "Discover", kind: "data", dur: 800, at: 800 },
        { link: "lx", label: "Discover", kind: "data", dur: 800, at: 800 }
      ]
    },
    {
      title: "Deux serveurs entendent la question.",
      text: "Le vrai, dans la baie, adossé à l'Active Directory — et le <b>Raspberry Pi</b> que l'attaquant a posé sous un bureau. Aucun des deux n'a plus de légitimité que l'autre aux yeux du protocole.",
      tone: "warn",
      set: { nodes: { pc: "active", dhcp: "active", atk: "evil" }, links: { ld: "s-on", lx: "s-evil" } }
    },
    {
      title: "Le pirate répond le premier.",
      text: "Il n'a <b>aucune vérification</b> à faire, aucune base à consulter, aucun bail à journaliser : quelques millisecondes. L'AD, lui, prend son temps. La seule exigence de l'attaque est là — être <b>plus rapide</b>.",
      tone: "evil",
      set: { nodes: { atk: "evil", dhcp: "active", pc: "active" }, links: { lx: "s-evil", ld: "s-on" } },
      packets: [
        { path: ["atk", "sw", "pc"], labels: ["DHCP Offer", "Offer (pirate)"], kind: "evil", dur: 1300, at: 0 },
        { link: "ld", dir: -1, label: "Offer (légitime)", kind: "ghost", dur: 900, at: 1100 }
      ]
    },
    {
      title: "Le client retient la première offre.",
      text: "C'est la <b>règle du protocole</b>, pas un bug : le client accepte l'offre qui lui parvient en premier et ignore les suivantes. L'offre légitime arrive trop tard et part à la poubelle.",
      tone: "evil",
      set: { nodes: { pc: "evil", atk: "evil", dhcp: "dead" }, links: { lx: "s-evil", ld: "s-cut" } },
      panel: [{ t: "IP  : 192.168.1.99/24", s: "warn" }, { t: "GW  : 192.168.1.66   <- le pirate", s: "evil" }, { t: "DNS : 192.168.1.66   <- le pirate", s: "evil" }]
    },
    {
      title: "Le vrai butin : passerelle ET résolveur.",
      text: "Le DHCP ne distribue pas « une adresse IP » — c'est la réponse à zéro point. Il distribue une <b>configuration réseau complète</b>. Celui qui répond choisit donc <b>où va tout le trafic sortant</b> et <b>comment se résout chaque nom</b>. C'est-à-dire tout.",
      tone: "evil",
      set: { nodes: { pc: "evil", atk: "pwn", dhcp: "dead" }, links: { lpc: "s-evil", lx: "s-evil", ld: "s-cut" }, badges: { atk: "passerelle + DNS de la victime" } }
    },
    {
      title: "Man-in-the-middle complet.",
      text: "Tout le trafic du poste transite désormais par l'attaquant avant de sortir. Il peut lire, modifier, rediriger — et y greffer une <b>interception TLS</b> s'il parvient à faire installer son autorité racine (voir le chapitre 30).",
      tone: "evil",
      set: { nodes: { pc: "evil", atk: "pwn", dhcp: "dead" }, links: { lpc: "s-evil", lx: "s-evil", ln: "s-evil", ld: "s-cut" } },
      packets: [
        { path: ["pc", "sw", "atk"], labels: ["trafic web", "trafic web"], kind: "evil", dur: 1300, at: 0 },
        { path: ["atk", "sw", "net"], labels: ["trafic web", "trafic web"], kind: "evil", dur: 1300, at: 900 }
      ]
    },
    {
      title: "La parade — le DHCP Snooping.",
      text: "Une fonction de niveau 2 des commutateurs manageables, dont tout le réglage tient en une question : <b>par quel port physique arrivent les réponses DHCP légitimes ?</b> Ce port devient <b>approuvé</b> ; sur tous les autres, une réponse DHCP entrante est <b>jetée</b> et le port <b>désactivé</b>.",
      tone: "ok",
      set: { nodes: { sw: "ok", dhcp: "ok", atk: "dead", pc: "ok" }, links: { ld: "s-ok", lx: "s-cut", lpc: "s-ok", ln: "s-ok" }, badges: { sw: "port 24 approuvé, les autres non", atk: "" } },
      panel: [{ t: "IP  : 192.168.1.42/24", s: "ok" }, { t: "GW  : 192.168.1.1", s: "ok" }, { t: "DNS : 192.168.1.10", s: "ok" }]
    },
    {
      title: "Pourquoi ça casse à l'école.",
      text: "Le DHCP Snooping n'est pas activé sur les commutateurs de l'établissement. C'est précisément pour cela qu'une machine virtuelle de TP dont on a oublié d'éteindre le serveur DHCP <b>met le réseau étudiant par terre</b> : elle répond plus vite que l'infrastructure. Même mécanisme exactement, sans intention malveillante.",
      tone: "warn",
      set: { nodes: { atk: "warn", sw: "warn" }, links: { lx: "s-warn" }, badges: { atk: "ou juste une VM de TP oubliée" } }
    }
  ]
};

/* ===================================================================
   Ch. 34.3 — DHCP starvation : le pool est fini, on le vide.
   =================================================================== */
window.SCENES["dhcp-starvation"] = {
  title: "DHCP starvation — épuiser le pool d'adresses",
  w: 940, h: 400,
  nodes: [
    { id: "pc", x: 25, y: 30, w: 170, h: 88, kind: "host", label: "Poste légitime", sub: ["arrive à 9 h"] },
    { id: "atk", x: 25, y: 210, w: 170, h: 88, kind: "attacker", label: "Attaquant", sub: ["@MAC source forgée", "à chaque paquet"] },
    { id: "sw", x: 310, y: 120, w: 165, h: 95, kind: "switch", label: "Commutateur" },
    { id: "dhcp", x: 590, y: 120, w: 180, h: 95, kind: "server", label: "Serveur DHCP", sub: ["pool 192.168.1.0/24"] }
  ],
  links: [
    { id: "lpc", from: "pc", to: "sw", label: "port 2" },
    { id: "lx", from: "atk", to: "sw", label: "port 12" },
    { id: "ld", from: "sw", to: "dhcp", label: "vers la baie" }
  ],
  panel: { x: 25, y: 310, w: 890, h: 82, title: "Baux réservés par le serveur", rows: [] },
  steps: [
    {
      title: "Le pool, au départ.",
      text: "Un réseau de <b>classe C</b> : 254 adresses attribuables. C'est fini, et c'est tout le problème — un pool est une ressource <b>épuisable</b>.",
      set: { nodes: { dhcp: "ok" }, links: { ld: "s-ok", lpc: "s-ok" }, badges: { dhcp: "254 / 254 libres" } },
      panel: ["(aucun bail)"]
    },
    {
      title: "L'attaquant émet un Discover.",
      text: "Avec une <b>@MAC source forgée</b>. Pour le serveur, c'est simplement une machine de plus qu'il ne connaissait pas. Rien ne lui permet de vérifier qu'une @MAC correspond à une vraie carte réseau.",
      set: { nodes: { atk: "evil", dhcp: "ok" }, links: { lx: "s-evil", ld: "s-ok" }, badges: { dhcp: "254 / 254 libres" } },
      packets: [{ path: ["atk", "sw", "dhcp"], labels: ["Discover · 5e:2f..", "Discover · 5e:2f.."], kind: "evil", dur: 1400 }]
    },
    {
      title: "Le serveur réserve un bail.",
      text: "Il fait exactement son travail : il sort une adresse du pool et la <b>réserve</b> pour cette @MAC, pendant toute la durée du bail. Aucune faille n'est exploitée ici non plus.",
      tone: "warn",
      set: { nodes: { atk: "evil", dhcp: "warn" }, links: { lx: "s-evil", ld: "s-warn" }, badges: { dhcp: "253 / 254 libres" } },
      panel: [{ t: "5e:2f:a0:11 -> 192.168.1.10   (bail réservé)", s: "warn" }],
      packets: [{ path: ["dhcp", "sw", "atk"], labels: ["Offer .10", "Offer .10"], kind: "warn", dur: 1400 }]
    },
    {
      title: "Et on recommence 254 fois.",
      text: "<b>Yersinia</b> ou <code>dhcpstarv</code> le font en quelques secondes. Sur un <b>/24</b>, <b>254 requêtes suffisent</b> à vider entièrement le pool.",
      tone: "evil",
      set: { nodes: { atk: "evil", dhcp: "evil" }, links: { lx: "s-evil", ld: "s-evil" }, badges: { dhcp: "0 / 254 libre — POOL VIDE" } },
      panel: [{ t: "5e:2f:a0:11 -> .10   a1:03:7d:c4 -> .11   7c:bb:19:e8 -> .12   ...", s: "evil" }, { t: "254 baux réservés par des cartes réseau qui n'existent pas", s: "evil" }],
      packets: [
        { path: ["atk", "sw", "dhcp"], labels: ["Discover", "Discover"], kind: "evil", dur: 900, at: 0 },
        { path: ["atk", "sw", "dhcp"], labels: ["Discover", "Discover"], kind: "evil", dur: 900, at: 250 },
        { path: ["atk", "sw", "dhcp"], labels: ["Discover", "Discover"], kind: "evil", dur: 900, at: 500 },
        { path: ["atk", "sw", "dhcp"], labels: ["Discover", "Discover"], kind: "evil", dur: 900, at: 750 }
      ]
    },
    {
      title: "Le poste légitime arrive.",
      text: "Il émet son <code>Discover</code> comme tous les matins. Le serveur n'a <b>plus une seule adresse</b> à lui donner : silence. Pour l'utilisateur, « le réseau ne marche pas », sans le moindre indice de ce qui se passe.",
      tone: "evil",
      set: { nodes: { atk: "evil", dhcp: "evil", pc: "dead" }, links: { lx: "s-evil", ld: "s-evil", lpc: "s-cut" }, badges: { dhcp: "0 / 254 libre" } },
      packets: [
        { path: ["pc", "sw", "dhcp"], labels: ["Discover", "Discover"], kind: "data", dur: 1300, at: 0 },
        { path: ["dhcp", "sw", "pc"], labels: ["(aucune offre)", "(aucune offre)"], kind: "ghost", dur: 1300, at: 1300 }
      ]
    },
    {
      title: "Un déni de service — et un préalable.",
      text: "En soi c'est déjà un <b>DoS</b> propre et silencieux. Mais l'attaque prépare surtout la précédente : un pool vide laisse le <b>champ libre au serveur pirate</b>, qui devient alors le seul à pouvoir répondre. Starvation puis spoofing, dans cet ordre.",
      tone: "evil",
      set: { nodes: { atk: "pwn", dhcp: "dead", pc: "dead" }, links: { lx: "s-evil", ld: "s-cut", lpc: "s-cut" }, badges: { atk: "seul serveur qui répond encore" } }
    },
    {
      title: "La parade — trois couches.",
      text: "<b>Port security</b> : limiter le nombre d'@MAC apprises par port casse déjà l'attaque, puisqu'elle repose sur des milliers d'@MAC vues sur un seul port. <b>Rate limit DHCP</b> par port. <b>DHCP snooping</b>, qui neutralise du même coup la starvation et le spoofing. En <b>DMZ</b>, pas de DHCP du tout : adressage statique et entrées ARP figées.",
      tone: "ok",
      set: { nodes: { sw: "ok", dhcp: "ok", pc: "ok", atk: "dead" }, links: { lx: "s-cut", ld: "s-ok", lpc: "s-ok" }, badges: { sw: "2 @MAC max + rate limit", dhcp: "254 / 254 libres", atk: "" } },
      panel: [{ t: "port 12 : 3e @MAC détectée -> ERR-DISABLE, alerte SNMP", s: "ok" }, { t: "254 / 254 adresses de nouveau disponibles", s: "ok" }]
    }
  ]
};
