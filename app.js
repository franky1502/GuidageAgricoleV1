let ligne = 0;

let tracteurX = 14;
let tracteurY = 10;

let premierePasse = 14;
let largeurTravail = 20;
let modeReference = "bord";

let ecart = 0;
let ecartLigne = 0;

let pointA = null;
let pointB = null;

let longueurAB = 0;
let capAB = 0;

let nombreMesures = 0;
let sommeEcarts = 0;
let sommeEcartsCarres = 0;
let sigmaConduite = 0;

let simulationActive = false;

let capTracteur = 0;

let deriveCap = 0;

let vitesseSimu = 2.0; // m/s ≈ 7,2 km/h

let timerSimulation = null;

let ecartObserve = 0;

let chronoObservation = 0;

let correctionConducteur = 0;

let pauseX = 0;
let pauseY = 0;

let lignePause = 0;

let distancePauseLigne = 0;

let capPause = 0;

const MODE_TRAVAIL = 0;
const MODE_DEMI_TOUR = 1;
const MODE_RACCROCHAGE = 2;
const MODE_PAUSE = 3;

let modeGuidage = MODE_TRAVAIL;
let ligneCible = 0;

let demiTourActif = false;
let progressionDemiTour = 0;

let pointPauseRetrouve = false;

let modeGPS = false;

let latitudeOrigine = null;
let longitudeOrigine = null;
let nombrePointsGPS = 0;
let pointsGPSAcceptes = [];

const SEUIL_DISTANCE = 1.00;
const SEUIL_REJET = 2.00;
const VITESSE_MIN_DN = 3.0; // km/h
const NB_POINTS_MIN_DN = 5;

const chkGPS =
    document.getElementById("chkGPS");
const VITESSE_MIN_DN = 3.0; // km/h
const NB_POINTS_MIN_DN = 5;
modeGPS =
    chkGPS.checked;

const historiqueGPS = [];  
const NB_POINTS_REGRESSION = 10;
const NB_POINTS_AFFICHAGE = 30;

const DEMI_TOUR_DROITE = 1;
const DEMI_TOUR_GAUCHE = -1;

let sensDemiTour = DEMI_TOUR_DROITE;

const ligneMoins = document.getElementById("ligneMoins");
const ligneActive = document.getElementById("ligneActive");
const lignePlus = document.getElementById("lignePlus");

const tracteur = document.getElementById("tracteur");
const ecartTexte = document.getElementById("ecart");

const btnA = document.getElementById("btnStartRef");
const btnB = document.getElementById("btnStopRef");

const textePointReprise =
    pointPauseRetrouve
        ? "✓ Point de reprise retrouvé"
        : "⚠ Point de reprise non retrouvé";

const texteSensReprise =
    "✓ Sens de reprise correct";


btnA.style.background = "#f3eb51";
btnB.style.background = "#f3eb51";
btnA.style.color = "black";
btnB.style.color = "black";

let distanceLigne;

if (modeReference === "bord") {

    if (ligne === 0) {

        distanceLigne = 0;

    } else {

        distanceLigne =
            premierePasse +
            (ligne - 1) * largeurTravail;
    }

}
else {

    distanceLigne =
        ligne * largeurTravail;
}

document.getElementById("btnPlus").addEventListener("click", () => {

    ligne++;
reinitialiserSigma()
    afficher();
});

document.getElementById("btnMoins").addEventListener("click", () => {

    if (modeReference === "bord") {

        if (ligne > 0) {
            ligne--;
        }

    } else {

        ligne--;

    }
reinitialiserSigma()
    afficher();
});

btnA.addEventListener("click", () => {

    pointA = {
        x: 0,
        y: 0
    };

    document.getElementById("etatReference").textContent =
        "Point A enregistré";

        btnA.style.background = "#00aa00";
        btnA.style.color = "white";
        btnB.style.background = "#ff9800";
        btnB.style.color = "black";
});



btnB.addEventListener("click", () => {

    if (!pointA) {

        alert("Définir A d'abord");
        return;
    }

    const capTest = 269;

const angleRad =
    capTest * Math.PI / 180;

pointB = {

    x:
        200 * Math.sin(angleRad),

    y:
        200 * Math.cos(angleRad)

};

tracteurX = pointA.x;
tracteurY = pointA.y;


btnB.style.background = "#00aa00";
btnB.style.color = "white";

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;

    longueurAB = Math.sqrt(dx * dx + dy * dy);

    const angleMath =
        Math.atan2(dy, dx) * 180 / Math.PI;

    capAB = 90 - angleMath;

    if (capAB < 0) capAB += 360;

    afficherEtatReference();
    

reinitialiserSigma()

    afficher();

});

document
.querySelectorAll('input[name="modeRef"]')
.forEach(radio => {

    radio.addEventListener("change", () => {

        modeReference = radio.value;

        afficher();
    });

});

document.getElementById("btnGauche").addEventListener("click", () => {

    tracteurX -= 0.50;

    afficher();
});

document.getElementById("btnDroite").addEventListener("click", () => {

    tracteurX += 0.50;

    afficher();
});

document.getElementById("btnAuto")
.addEventListener("click", () => {

    if (!simulationActive) {

        demarrerSimulation();

    } else {

        arreterSimulation();
    }
});

document.getElementById("btnTestDemiTour")
.addEventListener("click", () => {

    modeGuidage = MODE_DEMI_TOUR;

    ligneCible =
    ligne + 1;

    demiTourActif = true;
    progressionDemiTour = 0;

    afficherEtatReference();

    afficher();
});


document
.getElementById("btnTestRaccrochage")
.addEventListener("click", () => {

    modeGuidage = MODE_RACCROCHAGE;

    // On place artificiellement le tracteur
    // à 0,30 m de la ligne cible
    const distanceCible =
        calculerDistanceLigne(ligneCible);

    const distanceTest =
        distanceCible - 0.30;

    // Repositionnement sur l'axe AB
    tracteurX = 0;
    tracteurY = distanceTest;

    afficher();
});

document
.getElementById("btnInverserDT")
.addEventListener("click", () => {

    sensDemiTour *= -1;

    afficherEtatReference();

});

const btnPause =
    document.getElementById("btnPause");

const btnReprendre =
    document.getElementById("btnReprendre");

btnPause.addEventListener("click", () => {

    pauseX = tracteurX;
    pauseY = tracteurY;

    lignePause = ligne;

    distancePauseLigne =
        avancementAB(
            tracteurX,
            tracteurY
        );

    capPause = capTracteur;

    modeGuidage = MODE_PAUSE;

    afficherEtatReference();
    afficher();
});

btnReprendre.addEventListener("click", () => {

    if (!pointPauseRetrouve) {

        alert(
            "Revenir au point de pause"
        );

        return;
    }

    modeGuidage = MODE_TRAVAIL;

    btnReprendre.classList.remove(
        "clignote"
    );

    afficherEtatReference();
    afficher();
});



chkGPS.addEventListener(
    "change",
    () => {

        modeGPS =
            chkGPS.checked;

        console.log(
            modeGPS
                ? "GPS réel"
                : "Simulateur"
        );
    }
);

function afficher() {
    
let restantDemiTour = 0;

if (sensDemiTour === DEMI_TOUR_DROITE) {

    if (modeReference === "bord" && ligne === 0) {

        ligneMoins.textContent = "";

    } else {

        ligneMoins.textContent = ligne - 1;

    }

    ligneActive.textContent = ligne;
    lignePlus.textContent = ligne + 1;

}
else {

    ligneMoins.textContent = ligne + 1;
    ligneActive.textContent = ligne;

    if (modeReference === "bord" && ligne === 0) {

        lignePlus.textContent = "";

    } else {

        lignePlus.textContent = ligne - 1;

    }

}

    let distanceLigneCourante;

if (modeReference === "bord") {

    if (ligne === 0) {

        distanceLigneCourante = 0;

    } else {

        distanceLigneCourante =
            premierePasse +
            (ligne - 1) * largeurTravail;
    }

}
else {

    distanceLigneCourante =
        ligne * largeurTravail;
}

    const distanceMoins =
    distanceLigneCourante - largeurTravail;

const distancePlus =
    distanceLigneCourante + largeurTravail;


if (sensDemiTour === DEMI_TOUR_DROITE) {

    // Ordre normal
    if (modeReference === "bord" && ligne === 0) {

        document.getElementById("distanceMoins").textContent = "";

    } else {

        document.getElementById("distanceMoins").textContent =
            distanceMoins.toFixed(0) + " m";
    }

    document.getElementById("distanceActive").textContent =
        distanceLigneCourante.toFixed(0) + " m";

    document.getElementById("distancePlus").textContent =
        distancePlus.toFixed(0) + " m";

}
else {

    // Ordre inversé
    document.getElementById("distanceMoins").textContent =
        distancePlus.toFixed(0) + " m";

    document.getElementById("distanceActive").textContent =
        distanceLigneCourante.toFixed(0) + " m";

    if (modeReference === "bord" && ligne === 0) {

        document.getElementById("distancePlus").textContent = "";

    } else {

        document.getElementById("distancePlus").textContent =
            distanceMoins.toFixed(0) + " m";
    }

}

    if (pointA && pointB) {

    const distanceTracteur =
        distanceSigneeAB(
            tracteurX,
            tracteurY
        );

        ecartLigne =
        distanceTracteur -
        distanceLigneCourante;



   if (modeGuidage === MODE_TRAVAIL) {

    nombreMesures++;

    sommeEcarts += ecartLigne;

    sommeEcartsCarres +=
        ecartLigne * ecartLigne;
}     
   

const distanceCible =
    calculerDistanceLigne(ligneCible);


restantDemiTour =
    Math.abs(
        distanceCible -
        distanceTracteur
    );

if (
    modeGuidage === MODE_DEMI_TOUR &&
    restantDemiTour < 4
) {
    modeGuidage = MODE_RACCROCHAGE;
}

if (
    modeGuidage === MODE_RACCROCHAGE &&
    restantDemiTour < 0.50
) {
    modeGuidage = MODE_TRAVAIL;
    ligne = ligneCible;

    capTracteur = capAB;

    ecartLigne = 0;

    document.getElementById("avancement")
        .textContent = "0 m";
        
    reinitialiserSigma();

// Après le demi-tour, on inverse le sens d'affichage
    if (sensDemiTour === DEMI_TOUR_DROITE) {
        sensDemiTour = DEMI_TOUR_GAUCHE;
    } else {
        sensDemiTour = DEMI_TOUR_DROITE;
    }

    afficherEtatReference();
}


document.getElementById("debugEcart").textContent =
    "Ligne=" + ligne +
    "  Cible=" + ligneCible +
    "  DistTrac=" + distanceTracteur.toFixed(1) +
    "  DistCible=" + distanceCible.toFixed(1) +
    "  Reste=" + restantDemiTour.toFixed(1);



if (
    modeGuidage === MODE_TRAVAIL &&
    nombreMesures > 0
) {
    const moyenne =
        sommeEcarts / nombreMesures;

    sigmaConduite = Math.sqrt(
        sommeEcartsCarres / nombreMesures -
        moyenne * moyenne
    );
}


if (pointA && pointB) {

    if (
        modeGuidage === MODE_TRAVAIL
    ) {
        const avancement =
            avancementAB(
                tracteurX,
                tracteurY
            );

        document.getElementById("avancement")
            .textContent =
            avancement.toFixed(0) + " m";
    }
}

}
  
    document.getElementById("debugEcart").textContent =
    "Écart = " + ecartLigne.toFixed(2) + " m";
    
    const centre = 50;

  
document.getElementById("sigma").textContent =
    "σ = " +
    sigmaConduite.toFixed(2) +
    " m";

// Saturation visuelle à ±3 m
const ecartAffichage = Math.max(-3, Math.min(3, ecartLigne));

// 3 m = 35 % de déplacement visuel
const decalage = (ecartAffichage / 3) * 35;

const positionTracteur = centre + decalage;

tracteur.style.left = positionTracteur + "%";

    if (Math.abs(ecartLigne) < 0.2) {

        tracteur.style.background = "green";

        ecartTexte.innerHTML = "";

    }
    else {

        const erreur = Math.abs(ecartLigne);

if (erreur < 1) {

    tracteur.style.background = "orange";
    ecartTexte.style.color = "orange";
    ecartTexte.style.fontSize = "28px";
    ecartTexte.style.top = "195px";
}
else if (erreur <= 3) {

    tracteur.style.background = "#cc0000";
    ecartTexte.style.color = "#cc0000";
    ecartTexte.style.fontSize = "28px";
    ecartTexte.style.top = "195px";
}
else {

    tracteur.style.background = "#ff0000";
    ecartTexte.style.color = "#ff0000";
    ecartTexte.style.fontSize = "42px";
    ecartTexte.style.fontWeight = "900";
    ecartTexte.style.top = "160px";
}

let positionTexte;

if (ecartLigne > 0) {

    positionTexte = positionTracteur - 10;

}
else {

    positionTexte = positionTracteur - 2;

}

positionTexte = Math.max(5, Math.min(68, positionTexte));

ecartTexte.style.left = positionTexte + "%";

        if (ecartLigne > 0) {

            ecartTexte.innerHTML =
                "← " + ecartLigne.toFixed(2) + " m";
        }
        else {

            ecartTexte.innerHTML =
                Math.abs(ecartLigne).toFixed(2) + " m →";
        }
    }

if (
    modeGuidage === MODE_DEMI_TOUR ||
    modeGuidage === MODE_RACCROCHAGE

    ) {

    tracteur.style.width = "60px";
    tracteur.style.height = "30px";
    tracteur.style.top = "80px";

    if (sensDemiTour === DEMI_TOUR_DROITE) {
    tracteur.style.left = "72%";
} else {
    tracteur.style.left = "28%";
}

    ecartTexte.style.color = "#0066ff";
    ecartTexte.style.fontSize = "36px";
    ecartTexte.style.fontWeight = "700";

    ecartTexte.style.top = "36px";

    if (sensDemiTour === DEMI_TOUR_DROITE) {
    ecartTexte.style.left = "72%";
} else {
    ecartTexte.style.left = "28%";
}

    ecartTexte.innerHTML =
        restantDemiTour.toFixed(1) + " m";

} else {

    tracteur.style.width = "30px";
    tracteur.style.height = "60px";
    tracteur.style.top = "180px";
    tracteur.style.display = "block";
}



if (modeGuidage === MODE_PAUSE) {

    tracteur.style.display = "none";

    ecartTexte.style.position = "absolute";
    ecartTexte.style.left = "50%";
    ecartTexte.style.top = "40px";
    ecartTexte.style.transform =
        "translateX(-50%)";


    ecartTexte.style.fontSize = "16px";
    ecartTexte.style.lineHeight = "1.2";
    ecartTexte.style.textAlign = "center";
    ecartTexte.style.whiteSpace = "normal";

    const dx = pauseX - tracteurX;

    const dy = pauseY - tracteurY;

    const distancePause =
    Math.sqrt(
        dx * dx +
        dy * dy

    );

    pointPauseRetrouve =
    distancePause < 50;

    const anglePause =
    Math.atan2(dy, dx) * 180 / Math.PI;   

let flechePause = "↑";

if (anglePause >= -22.5 && anglePause < 22.5)
    flechePause = "→";

else if (anglePause >= 22.5 && anglePause < 67.5)
    flechePause = "↗";

else if (anglePause >= 67.5 && anglePause < 112.5)
    flechePause = "↑";

else if (anglePause >= 112.5 && anglePause < 157.5)
    flechePause = "↖";

else if (anglePause >= 157.5 || anglePause < -157.5)
    flechePause = "←";

else if (anglePause >= -157.5 && anglePause < -112.5)
    flechePause = "↙";

else if (anglePause >= -112.5 && anglePause < -67.5)
    flechePause = "↓";

else
    flechePause = "↘";

    
    const textePointReprise =
    pointPauseRetrouve
        ? "✓ Point de reprise retrouvé"
        : "⚠ Point de reprise non retrouvé";

    const texteSensReprise =
    "✓ Sens de reprise correct";


    ecartTexte.innerHTML =

    "PAUSE TRAVAIL<br>" +

    "Ligne " + lignePause +

    "     Sens A → B<br>" +

    "Début de ligne à : " +

    distancePauseLigne.toFixed(0) +

    " m<br><br>" +

    flechePause + " " +

    distancePause.toFixed(0) +

    " m<br><br>" +

    textePointReprise + "<br>" +

    texteSensReprise;


if (pointPauseRetrouve) {

    btnReprendre.classList.add(
        "clignote"
    );

} else {

    btnReprendre.classList.remove(
        "clignote"
    );
}

    return;
}



}

function distanceSigneeAB(px, py) {

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;

    return (
        (px - pointA.x) * dy -
        (py - pointA.y) * dx
    ) / Math.sqrt(dx * dx + dy * dy);
}

function reinitialiserSigma() {

    nombreMesures = 0;
    sommeEcarts = 0;
    sommeEcartsCarres = 0;
    sigmaConduite = 0;
}

function demarrerSimulation() {

    if (!pointA || !pointB) {

        alert("Définir A-B d'abord");
        return;
    }

    simulationActive = true;

    capTracteur = capAB;

    timerSimulation =
        setInterval(simulerPas, 100);
}

function arreterSimulation() {

    simulationActive = false;

    clearInterval(timerSimulation);
}

function simulerPas() {

    if (modeGPS) {
        return;
    }

    if (modeGuidage === MODE_PAUSE) {
        return;
    }

    if (demiTourActif) {

    progressionDemiTour += 0.01;

    if (progressionDemiTour >= 1) {
        progressionDemiTour = 1;
        demiTourActif = false;
    }

    // Rotation progressive de 180°
    const rotation =
        180 * progressionDemiTour;

    capTracteur =
        capAB +
        sensDemiTour * rotation;

    if (capTracteur >= 360) {
        capTracteur -= 360;
    }

    if (capTracteur < 0) {
        capTracteur += 360;
    }

    // Distance entre la ligne actuelle
    // et la ligne cible
    const distanceLigneActuelle =
        calculerDistanceLigne(ligne);

    const distanceLigneCible =
        calculerDistanceLigne(ligneCible);

    const largeurDemiTour =
        Math.abs(
            distanceLigneCible -
            distanceLigneActuelle
        );

    // Progression latérale vers la ligne cible
    const progressionLaterale =
        (1 - Math.cos(
            Math.PI * progressionDemiTour
        )) / 2;

    const distanceAB =
        distanceLigneActuelle +
        (distanceLigneCible -
        distanceLigneActuelle) *
        progressionLaterale;

    // On place le tracteur sur cette trajectoire
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;

    const longueur =
        Math.sqrt(dx * dx + dy * dy);

    const nx = dy / longueur;
    const ny = -dx / longueur;

    tracteurX =
        pointA.x +
        dx / longueur * 0 +
        nx * distanceAB;

    tracteurY =
        pointA.y +
        dy / longueur * 0 +
        ny * distanceAB;

    afficher();

    return;

}

capTracteur = capAB;


        // Petite hésitation humaine
    chronoObservation += 0.1;

if (chronoObservation >= 0.5) {

    chronoObservation = 0;

    ecartObserve =
        ecartLigne +
        (Math.random() - 0.5) * 0.3;

    if (Math.abs(ecartObserve) < 0.10) {

        correctionConducteur = 0;

    } else if (Math.abs(ecartObserve) < 0.60) {

        correctionConducteur =
            -ecartObserve * 0.15;

    } else {

        correctionConducteur =
            -ecartObserve * 0.25;
    }
}

    // Limite de correction
    deriveCap +=
    correctionConducteur * 0.03;

    
    deriveCap +=
    (Math.random() - 0.5) * 0.05;

if (Math.random() < 0.01) {

    deriveCap +=
        (Math.random() - 0.5) * 1;
}

    deriveCap =
    Math.max(
        -8,
        Math.min(
            8,
            deriveCap
        )
    );

    capTracteur =
        capAB + deriveCap;

    const ecartCap =
    Math.abs(
        differenceAngulaire(
            capTracteur,
            capAB
        )
    );

if (
    modeGuidage === MODE_TRAVAIL &&
    ecartCap > 60
) {

    modeGuidage = MODE_DEMI_TOUR;
}

    const angleRad =
        (90 - capTracteur) *
        Math.PI / 180;

    const distance =
        vitesseSimu * 0.1;

    tracteurX +=
        distance *
        Math.cos(angleRad);

    tracteurY +=
        distance *
        Math.sin(angleRad);

    afficher();
}

function avancementAB(px, py) {

    const dx =
        pointB.x - pointA.x;

    const dy =
        pointB.y - pointA.y;

    const longueur =
        Math.sqrt(dx * dx + dy * dy);

    return (
        (px - pointA.x) * dx +
        (py - pointA.y) * dy
    ) / longueur;
}

function differenceAngulaire(a, b) {

    let diff = a - b;

    while (diff > 180) {
        diff -= 360;
    }

    while (diff < -180) {
        diff += 360;
    }

    return diff;
}

function nomMode() {

    switch (modeGuidage) {

        case MODE_TRAVAIL:
            return "TRAVAIL";

        case MODE_DEMI_TOUR:
            return "DEMI-TOUR";

        case MODE_RACCROCHAGE:
            return "RACCROCHAGE";

        case MODE_PAUSE:
            return "PAUSE";    

        default:
            return "?";
    }
}

function afficherEtatReference() {

    const distanceTracteur =
        distanceSigneeAB(
            tracteurX,
            tracteurY
        );

    let distanceLigne;

    if (modeReference === "bord") {

        if (ligne === 0) {

            distanceLigne = 0;

        } else {

            distanceLigne =
                premierePasse +
                (ligne - 1) * largeurTravail;
        }

    } else {

        distanceLigne =
            ligne * largeurTravail;
    }

    ecartLigne =
        distanceTracteur -
        distanceLigne;

    document.getElementById("etatReference").textContent =

        "Réf. : " +

        longueurAB.toFixed(0) +

        " m | Cap réf : " +

        capAB.toFixed(1) +

        "° | Cap trac : " +

        capTracteur.toFixed(1) +

        "° | Ligne : " +

        distanceLigne.toFixed(0) +

        " m | Trac : " +

        distanceTracteur.toFixed(2) +

        " m | Écart : " +

        ecartLigne.toFixed(2) +

        " m | Mode : " +

        nomMode();

    }

function calculerDistanceLigne(ligneTest) {

    if (modeReference === "bord") {

        if (ligneTest === 0) {
            return 0;
        }

        return (
            premierePasse +
            (ligneTest - 1) * largeurTravail
        );
    }

    return ligneTest * largeurTravail;
}


function demarrerGPS() {

    if (!navigator.geolocation) {

        alert("GPS non disponible");
        return;
    }

    navigator.geolocation.watchPosition(

        position => {

            if (!modeGPS) {
                return;
            }


            /*
             * 1. Lecture GPS
             */

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            const precision =
                position.coords.accuracy;

            const vitesse =
                position.coords.speed ?? 0;

            const vitesseKmH =
            vitesse * 3.6;

            const cap =
                position.coords.heading;


            /*
             * 2. Origine
             */

            if (latitudeOrigine === null) {

                latitudeOrigine = lat;
                longitudeOrigine = lon;
            }


            /*
             * 3. GPS -> XY
             */

            const pointXY =
                convertirGPSVersXY(
                    lat,
                    lon
                );


            /*
             * 4. Numéro du point
             */

            nombrePointsGPS++;


            /*
             * 5. Création du point GPS brut
             */

            const nouveauPoint = {

                numero:
                    nombrePointsGPS,

                latitude:
                    lat,

                longitude:
                    lon,

                x:
                    pointXY.x,

                y:
                    pointXY.y,

                precision:
                    precision,

                vitesse:
                    vitesse,

                cap:
                    cap,

                capDn:
                    null,

                sigma:
                    null,

                distancePnDnAvantTest:
                    null,

                distancePnDnApresAcceptation:
                    null,

                ecartDnPrisEnCompte:
                    null,

                statut:
                    "ACCEPTE",

                statut: "INITIALISATION",    

                suspect:
                    false,

                elimine:
                    false,

                temps:
                    Date.now()
            };


            /*
             * 6. Tous les points GPS restent
             *    visibles dans historiqueGPS
             */

            historiqueGPS.push(
                nouveauPoint
            );

           if (
             vitesseKmH < VITESSE_MIN_DN
            ) {

            nouveauPoint.statut =
            "INITIALISATION";

            afficherFenetreGPS(null);

             return;
            } 

            while (
    historiqueGPS.length >
    NB_POINTS_AFFICHAGE
) {

    historiqueGPS.shift();
}


            /*
             * 7. Dn AVANT l'intégration de Pn
             *
             *    Pn ne participe donc pas
             *    à la Dn qui sert à le qualifier.
             */

            if (
    pointsGPSAcceptes.length === 0
) {

    nouveauPoint.statut =
        "DEPART";

    pointsGPSAcceptes.push(
        nouveauPoint
    );

    afficherFenetreGPS(null);

    return;
}

            let donneesDnAvant = {

    trajectoire: null,

    capDn: null,

    sigma: 0
};

if (
    pointsGPSAcceptes.length >=
    NB_POINTS_MIN_DN
) {

    donneesDnAvant =
        calculerDonneesDn(
            pointsGPSAcceptes
        );
}
           

            /*
             * 8. Seuils fixes
             *
             *    T = 1,00 m
             *    2T = 2,00 m
             */

            const seuilDistance =
                1.00;

            const seuilRejet =
                2.00;


            /*
             * 9. Qualification du nouveau point
             */

            let pointSuspect =
                false;

            let pointRejete =
                false;

            let pointPourCalcul =
                nouveauPoint;


            if (
                donneesDnAvant.trajectoire
            ) {

                const distanceTest =
                    calculerDistancePointDn(
                        nouveauPoint,
                        donneesDnAvant.trajectoire
                    );


                /*
                 * Distance brute de Pn à Dn AVANT test
                 */

                nouveauPoint.distancePnDnAvantTest =
                    distanceTest;


                /*
                 * CAS 1
                 *
                 * d_Dn <= T
                 *
                 * ACCEPTÉ
                 */

                if (
                    distanceTest <=
                    seuilDistance
                ) {

                    nouveauPoint.statut =
                        "ACCEPTE";

                    nouveauPoint.suspect =
                        false;

                    nouveauPoint.elimine =
                        false;
                }


                /*
                 * CAS 2
                 *
                 * T < d_Dn <= 2T
                 *
                 * SUSPECT
                 */

                else if (
                    distanceTest <=
                    seuilRejet
                ) {

                    pointSuspect =
                        true;

                    nouveauPoint.statut =
                        "SUSPECT";

                    nouveauPoint.suspect =
                        true;

                    nouveauPoint.elimine =
                        false;


                    /*
                     * Écart retenu pour le calcul
                     *
                     * écart corrigé =
                     * T + (d_Dn - T) / 2
                     *
                     * soit :
                     *
                     * (T + d_Dn) / 2
                     */

                    const ecartCorrige =
                        (
                            seuilDistance +
                            distanceTest
                        ) / 2;


                    nouveauPoint.ecartDnPrisEnCompte =
                        ecartCorrige;


                    /*
                     * Projection orthogonale
                     * du point GPS sur Dn
                     */

                    const trajectoire =
                        donneesDnAvant.trajectoire;

                    const dx =
                        nouveauPoint.x -
                        trajectoire.x;

                    const dy =
                        nouveauPoint.y -
                        trajectoire.y;

                    const projection =
                        dx * trajectoire.vx +
                        dy * trajectoire.vy;


                    const pointProjection = {

                        x:
                            trajectoire.x +
                            projection *
                            trajectoire.vx,

                        y:
                            trajectoire.y +
                            projection *
                            trajectoire.vy
                    };


                    /*
                     * Distance à déplacer vers Dn
                     *
                     * d_Dn - écart corrigé
                     */

                    const distanceAReculer =
                        distanceTest -
                        ecartCorrige;


                    let proportionDeplacement =
                        0;

                    if (
                        distanceTest > 0
                    ) {

                        proportionDeplacement =
                            distanceAReculer /
                            distanceTest;
                    }


                    /*
                     * Point corrigé utilisé
                     * pour Dn et Sigma
                     */

                    pointPourCalcul = {

                        ...nouveauPoint,

                        x:
                            nouveauPoint.x +
                            (
                                pointProjection.x -
                                nouveauPoint.x
                            ) *
                            proportionDeplacement,

                        y:
                            nouveauPoint.y +
                            (
                                pointProjection.y -
                                nouveauPoint.y
                            ) *
                            proportionDeplacement
                    };
                }


                /*
                 * CAS 3
                 *
                 * d_Dn > 2T
                 *
                 * REJETÉ
                 */

                else {

                    nouveauPoint.statut =
                    "ACCEPTE";

                    pointRejete =
                        true;

                    nouveauPoint.statut =
                        "REJETE";

                    nouveauPoint.suspect =
                        false;

                    nouveauPoint.elimine =
                        true;
                }
            }


            /*
             * 10. Point rejeté
             *
             *     Il reste dans historiqueGPS
             *     mais ne rentre PAS dans
             *     pointsGPSAcceptes.
             */

            if (
                pointRejete
            ) {

                console.log(
                    "Point rejeté : P" +
                    nouveauPoint.numero +
                    " | d_Dn = " +
                    nouveauPoint.distancePnDnAvantTest.toFixed(2) +
                    " m"
                );
            }


            /*
             * 11. Point accepté ou suspect
             *
             *     Les deux participent à la
             *     nouvelle Dn.
             *
             *     Pour un suspect, c'est
             *     pointPourCalcul qui est utilisé.
             */

            else {

                pointsGPSAcceptes.push(
                    pointPourCalcul
                );


                /*
                 * Fenêtre glissante de 10
                 * points utilisés pour le calcul
                 */

                while (
                    pointsGPSAcceptes.length >
                    NB_POINTS_REGRESSION
                ) {

                    pointsGPSAcceptes.shift();
                }


                /*
                 * 12. Nouvelle Dn
                 *     avec les points retenus
                 */

                const donneesDn =
                    calculerDonneesDn(
                        pointsGPSAcceptes
                    );


                /*
                 * 13. Mémorisation de CapDn
                 *     et Sigma sur le point GPS brut
                 */

                nouveauPoint.capDn =
                    donneesDn.capDn;

                nouveauPoint.sigma =
                    donneesDn.sigma;


                /*
                 * 14. Distance de Pn brut
                 *     à la nouvelle Dn
                 */

                if (
                    donneesDn.trajectoire
                ) {

                    nouveauPoint.distancePnDnApresAcceptation =
                        calculerDistancePointDn(
                            nouveauPoint,
                            donneesDn.trajectoire
                        );
                }


                /*
                 * 15. Information console
                 *     pour un point suspect
                 */

                if (
                    pointSuspect
                ) {

                    console.log(
                        "Point suspect : P" +
                        nouveauPoint.numero +
                        " | d_Dn = " +
                        nouveauPoint.distancePnDnAvantTest.toFixed(2) +
                        " m | retenu = " +
                        nouveauPoint.ecartDnPrisEnCompte.toFixed(2) +
                        " m"
                    );
                }
            }


            /*
             * 16. Dn actuelle pour l'affichage
             */

            const donneesDnActuelles =
                calculerDonneesDn(
                    pointsGPSAcceptes
                );


            /*
             * 17. Tableau GPS
             */

            afficherFenetreGPS(
                donneesDnActuelles
            );


            /*
             * 18. Affichage du filtre
             */

            let texteFiltre =
                "T = 1,00 m | d_Dn = ";

            if (
                nouveauPoint.distancePnDnAvantTest !==
                null
            ) {

                texteFiltre +=
                    nouveauPoint.distancePnDnAvantTest.toFixed(2) +
                    " m";

            } else {

                texteFiltre +=
                    "---";
            }


            /*
             * Statut
             */

            texteFiltre +=
                " | " +
                nouveauPoint.statut;


            /*
             * Écart retenu pour un suspect
             */

            if (
                pointSuspect
            ) {

                texteFiltre +=
                    " | pris en compte = " +
                    nouveauPoint.ecartDnPrisEnCompte.toFixed(2) +
                    " m";
            }


            /*
             * 19. Affichage filtre
             */

            document.getElementById(
                "filtreGPSInfo"
            ).textContent =
                texteFiltre;


            /*
             * 20. Ancien affichage GPS supprimé
             */

            document.getElementById(
                "gpsInfo"
            ).innerHTML = "";

        },


        /*
         * Erreur GPS
         */

        erreur => {

            console.log(
                "Erreur GPS :",
                erreur.code,
                erreur.message
            );
        },


        /*
         * Options GPS
         */

        {

            enableHighAccuracy:
                true,

            maximumAge:
                0,

            timeout:
                10000
        }
    );
}

function calculerSigmaGPS() {

    if (historiqueGPS.length < 5) {

        return 0;

    }

    let sommePrecision = 0;

    for (const point of historiqueGPS) {

        sommePrecision +=
            point.precision;

    }

    const moyenne =
        sommePrecision /
        historiqueGPS.length;

    let sommeCarres = 0;

    for (const point of historiqueGPS) {

        const ecart =
            point.precision -
            moyenne;

        sommeCarres +=
            ecart * ecart;
    }

    return Math.sqrt(
        sommeCarres /
        historiqueGPS.length
    );
}

function convertirGPSVersXY(latitude, longitude) {

    const rayonTerre = 6378137;

    const deltaLatitude =
        (latitude - latitudeOrigine)
        * Math.PI / 180;

    const deltaLongitude =
        (longitude - longitudeOrigine)
        * Math.PI / 180;

    const x =
        deltaLongitude
        * rayonTerre
        * Math.cos(
            latitudeOrigine
            * Math.PI / 180
        );

    const y =
        deltaLatitude
        * rayonTerre;

    return { x, y };
}


function obtenirPointsRegression() {

    if (historiqueGPS.length < NB_POINTS_REGRESSION) {
        return [];
    }

    return historiqueGPS.slice(
        -NB_POINTS_REGRESSION
    );
}

function calculerRegressionLineaire(points) {

    const n = points.length;

    if (n < 2) {
        return null;
    }

    let sommeX = 0;
    let sommeY = 0;
    let sommeXY = 0;
    let sommeX2 = 0;

    for (const point of points) {

        sommeX += point.x;
        sommeY += point.y;
        sommeXY += point.x * point.y;
        sommeX2 += point.x * point.x;

    }

    const denominateur =
        n * sommeX2 -
        sommeX * sommeX;

    if (Math.abs(denominateur) < 0.000001) {
        return null;
    }

    const pente =
        (n * sommeXY -
         sommeX * sommeY)
        / denominateur;

    const ordonneeOrigine =
        (sommeY -
         pente * sommeX)
        / n;

    return {

        pente,

        ordonneeOrigine

    };
}

function calculerPointsIntermediaires(
    pointsSource
) {

    const pointsIntermediaires = [];

    if (
        pointsSource.length < 2
    ) {

        return pointsIntermediaires;
    }

    for (
        let index = 0;
        index < pointsSource.length - 1;
        index++
    ) {

        const point1 =
            pointsSource[index];

        const point2 =
            pointsSource[index + 1];

        pointsIntermediaires.push({

            x:
                (point1.x + point2.x) / 2,

            y:
                (point1.y + point2.y) / 2
        });
    }

    return pointsIntermediaires;
}

function calculerTrajectoireDn(pointsIntermediaires) {

    if (pointsIntermediaires.length < 2) {
        return null;
    }

    // 1. Centre géométrique des points PI
    let sommeX = 0;
    let sommeY = 0;

    for (const point of pointsIntermediaires) {

        sommeX += point.x;
        sommeY += point.y;
    }

    const moyenneX =
        sommeX / pointsIntermediaires.length;

    const moyenneY =
        sommeY / pointsIntermediaires.length;


    // 2. Matrice de dispersion
    let sommeXX = 0;
    let sommeYY = 0;
    let sommeXY = 0;

    for (const point of pointsIntermediaires) {

        const dx =
            point.x - moyenneX;

        const dy =
            point.y - moyenneY;

        sommeXX += dx * dx;
        sommeYY += dy * dy;
        sommeXY += dx * dy;
    }


    // 3. Direction principale de la trajectoire
    const angleMath =
        0.5 *
        Math.atan2(
            2 * sommeXY,
            sommeXX - sommeYY
        );

    let vx =
        Math.cos(angleMath);

    let vy =
        Math.sin(angleMath);


    // 4. Orienter Dn dans le sens du déplacement
    const premierPI =
        pointsIntermediaires[0];

    const dernierPI =
        pointsIntermediaires[
            pointsIntermediaires.length - 1
        ];

    const deplacementX =
        dernierPI.x - premierPI.x;

    const deplacementY =
        dernierPI.y - premierPI.y;

    const produitScalaire =
        vx * deplacementX +
        vy * deplacementY;

    if (produitScalaire < 0) {

        vx = -vx;
        vy = -vy;
    }


    // 5. Dn passe par le centre des PI
    return {

        x: moyenneX,
        y: moyenneY,

        vx: vx,
        vy: vy
    };
}

function determinerCapTrajectoireDn(trajectoire) {

    if (!trajectoire) {
        return null;
    }

    let cap =
        Math.atan2(
            trajectoire.vx,
            trajectoire.vy
        ) * 180 / Math.PI;

    if (cap < 0) {
        cap += 360;
    }

    return cap;
}


function calculerDonneesDn(
    pointsSource
) {

    const pointsIntermediaires =
        calculerPointsIntermediaires(
            pointsSource
        );

    if (
        pointsIntermediaires.length < 2
    ) {

        return {

            pointsIntermediaires:
                pointsIntermediaires,

            trajectoire: null,

            capDn: null,

            distancesDn: [],

            sigma: 0
        };
    }

    const trajectoire =
        calculerTrajectoireDn(
            pointsIntermediaires
        );

    if (!trajectoire) {

        return {

            pointsIntermediaires:
                pointsIntermediaires,

            trajectoire: null,

            capDn: null,

            distancesDn: [],

            sigma: 0
        };
    }

    const capDn =
        determinerCapTrajectoireDn(
            trajectoire
        );

    const distancesDn = [];
    const distancesSignees = [];

    for (
        const point of pointsSource
    ) {

        const distanceSignee =
            calculerDistancePointDn(
                point,
                trajectoire
            );

        distancesSignees.push(
            distanceSignee
        );

        distancesDn.push(
            distanceSignee
        );
    }

    let sommeDistances = 0;

    for (
        const distance
        of distancesSignees
    ) {

        sommeDistances += distance;
    }

    const moyenneDistances =
        sommeDistances /
        distancesSignees.length;

    let sommeCarres = 0;

    for (
        const distance
        of distancesSignees
    ) {

        const ecart =
            distance -
            moyenneDistances;

        sommeCarres +=
            ecart * ecart;
    }

    const sigma =
        Math.sqrt(
            sommeCarres /
            distancesSignees.length
        );

    return {

        pointsIntermediaires:
            pointsIntermediaires,

        trajectoire:
            trajectoire,

        capDn:
            capDn,

        distancesDn:
            distancesDn,

        sigma:
            sigma
    };
}

function afficherFenetreGPS(donneesDn) {

    const corps =
        document.getElementById(
            "corpsTableauGPS"
        );

    corps.innerHTML = "";

    /*
     * Du plus récent vers le plus ancien
     */

    for (
        let index = historiqueGPS.length - 1;
        index >= 0;
        index--
    ) {

        const point =
            historiqueGPS[index];

        const ligne =
            document.createElement("tr");

if (
    point.statut === "DEPART"
) {

    ligne.classList.add(
        "ligneDepart"
    );

}
else if (
    point.statut === "INITIALISATION"
) {

    ligne.classList.add(
        "ligneInitialisation"
    );

}
else if (
    point.statut === "SUSPECT"
) {

        if (point.statut === "SUSPECT") {

    ligne.classList.add("ligneSuspecte");

} else if (point.statut === "REJETE") {

    ligne.classList.add("ligneRejetee");
}

        const capGPS =
            point.cap != null
                ? point.cap.toFixed(0)
                : "---";

        const capDn =
        point.capDn !== null
        ? point.capDn.toFixed(0)
        : "---";

        const distanceDn =
    point.distancePnDnAvantTest !== null
        ? point.distancePnDnAvantTest.toFixed(2)
        : "---";

        const sigma =
        point.sigma !== null
        ? point.sigma.toFixed(2


        )
        : "---";

        ligne.innerHTML =

            "<td>P" +
            point.numero +
            "</td>" +

            "<td>" +
            point.x.toFixed(1) +
            "</td>" +

            "<td>" +
            point.y.toFixed(1) +
            "</td>" +

            "<td>" +
            (point.vitesse * 3.6).toFixed(1) +
            "</td>" +

            "<td>" +
            capGPS +
            "°</td>" +

            "<td>" +
            capDn +
            "°</td>" +

            "<td>" +
            distanceDn +
            "</td>" +

            "<td>" +
            sigma +
            "</td>";

        /*
         * Ajout dans l'ordre :
         * plus récent en haut
         */

        corps.appendChild(ligne);
    }
}


function calculerDistancePointDn(
    point,
    trajectoire
) {

    if (!trajectoire) {
        return null;
    }

    const dx =
        point.x - trajectoire.x;

    const dy =
        point.y - trajectoire.y;

    const distanceSignee =
        dx * trajectoire.vy -
        dy * trajectoire.vx;

    return Math.abs(
        distanceSignee
    );
}



afficher();

demarrerGPS();