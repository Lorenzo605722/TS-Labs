/*
# 🤖 Robot Monitor
Esercizio TypeScript su fetch GET, type guard e array methods.
Concetti usati: interfacce, union types, filter, map, reduce, forEach.
SCENARIO: sei uno sviluppatore junior in un'azienda di robotica.
Ricevi dal backend una lista di robot dal magazzino.
Il tuo compito è validarli e generare un report per il responsabile tecnico.
*/

interface RobotBase {
    id: number,
    modello: string,
    reparto: string,
}
interface RobotAttivo extends RobotBase {
    tipo: "Attivo",
    efficienzaPerc: number, // range 0-100
}
interface RobotFermo extends RobotBase {
    tipo: "Fermo",
    motivoStop: string,
}
type Robot = RobotAttivo | RobotFermo

const robot: Robot[] = [
    { id: 1, modello: "R-X1", reparto: "Assemblaggio", tipo: "Fermo", motivoStop: "Surriscaldamento" },
    { id: 2, modello: "R-X2", reparto: "Verniciatura", tipo: "Attivo", efficienzaPerc: 88 },
    { id: 3, modello: "R-X3", reparto: "Collaudo", tipo: "Fermo", motivoStop: "Manutenzione programmata" },
    { id: 4, modello: "R-X4", reparto: "Assemblaggio", tipo: "Attivo", efficienzaPerc: 72 },
    { id: 5, modello: "R-X5", reparto: "Magazzino", tipo: "Fermo", motivoStop: "Batteria scarica" },
    { id: 6, modello: "R-X6", reparto: "Verniciatura", tipo: "Attivo", efficienzaPerc: 95 },
    { id: 7, modello: "R-X7", reparto: "Collaudo", tipo: "Attivo", efficienzaPerc: 60 },
];

function validaStringa(a: unknown): a is string {
    return (typeof a === "string" && a.trim().length > 0);
}
function validaNumero(n: unknown): n is number {
    return (typeof n === "number" && Number.isInteger(n));
}
function validaRange(r: unknown, min: number, max: number): r is number {
    return (typeof r === "number" && r >= min && r <= max);
}

function isRobot(valore: unknown): valore is Robot {
    if (typeof valore !== "object" || valore === null) return false;
    const dato = valore as Record<string, unknown>;

    if (!validaNumero(dato.id) ||
        !validaStringa(dato.modello) ||
        !validaStringa(dato.reparto))
        return false;

    switch (dato.tipo) {
        case "Attivo":
            return (
                validaStringa(dato.tipo) &&
                validaRange(dato.efficienzaPerc, 0, 100)
            );
        case "Fermo":
            return (
                validaStringa(dato.tipo) &&
                validaStringa(dato.motivoStop)
            );
    }
    return false;
}

async function recuperaRobot(): Promise<Robot[]> {
    try {
        const risposta = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!risposta.ok) {
            throw new Error("Errore di connessione al server");
        }
        const datiGrezzi = await risposta.json();
        if (!Array.isArray(datiGrezzi)) return [];

        return datiGrezzi
            .map((p: any): Robot => {
                const base = { id: p.id, modello: p.name, reparto: p.company.name };
                if (p.id % 2 === 0) {
                    return { ...base, tipo: "Attivo", efficienzaPerc: p.id * 9 };
                } else {
                    return { ...base, tipo: "Fermo", motivoStop: p.username };
                }
            })
            .filter(isRobot);
    }
    catch (e) {
        console.error(e);
        return [];
    }
}

function generazioneReport(): void {

    const conteggioAttivi = robot.filter(m => m.tipo === "Attivo").length;
    console.log(`Robot Attivi: ${conteggioAttivi}`);

    const conteggioFermi = robot.filter(f => f.tipo === "Fermo").length;
    console.log(`Robot Fermi: ${conteggioFermi}`);

    const robotAttivi = robot.filter(j => j.tipo === "Attivo") as RobotAttivo[];
    const sommaMedia = robotAttivi.reduce((numero, j) => numero + j.efficienzaPerc, 0);
    const media = sommaMedia / robotAttivi.length;
    console.log(`Media efficienza: ${media.toFixed(2)}%`);

    const miglioreRobot = robotAttivi.reduce((max, l) =>
        l.efficienzaPerc > max.efficienzaPerc ? l : max);
    const peggioreRobot = robotAttivi.reduce((min, g) =>
        g.efficienzaPerc < min.efficienzaPerc ? g : min);
    console.log(`Migliore: ${miglioreRobot.modello}`);
    console.log(`Peggiore: ${peggioreRobot.modello}`);

    const robotFermi = robot.filter(d => d.tipo === "Fermo") as RobotFermo[];
    robotFermi.forEach(k => console.log(`${k.modello}: ${k.motivoStop}`));
}

generazioneReport();
