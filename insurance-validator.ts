// 🛡️ SCENARIO: lavori per una InsurTech che gestisce polizze auto.
// Il sistema riceve dati grezzi sulle polizze e deve distinguere tra
// polizze "Standard" e polizze "Premium" per calcolare il massimale medio.

interface PolizzaBase {
    id: number,
    codiceCliente: string,
    scadenza: string
}

interface PolizzaStandard extends PolizzaBase {
    tipo: "Standard",
    coperturaBase: number,
}

interface PolizzaPremium extends PolizzaBase {
    tipo: "Premium",
    serviziAccessori: number, // numero di servizi extra (es. soccorso stradale, cristalli)
}

type Polizza = PolizzaStandard | PolizzaPremium;

function isStringa(a: unknown): a is string {
    return (typeof a === "string" && a.trim().length > 0)
}

function isNumeri(b: unknown): b is number {
    return (typeof b === "number" && Number.isInteger(b))
}

function isPolizza(valore: unknown): valore is Polizza {
    if (typeof valore !== "object" || valore === null) return false;
    const dato = valore as Record<string, unknown>;
    
    if (typeof dato.tipo !== "string") return false;

    if (
        !isNumeri(dato.id) ||
        !isStringa(dato.codiceCliente) ||
        !isStringa(dato.scadenza)
    ) {
        return false;
    }

    switch (dato.tipo) {
        case "Standard":
            return (isNumeri(dato.coperturaBase))
        case "Premium":
            return (isNumeri(dato.serviziAccessori))
    }
    return false;
}

async function recuperaPolizze(): Promise<Polizza[]> {
    try {
        const risposta = await fetch("https://jsonplaceholder.typicode.com/users")
        if (!risposta.ok) {
            throw new Error("Errore nel recupero dati assicurativi!");
        }
        
        const datiGrezzi = await risposta.json()
        if (!Array.isArray(datiGrezzi)) return [];

        return datiGrezzi
            .map((p: any): Polizza => {
                const base = { 
                    id: p.id, 
                    codiceCliente: `CLI-${p.username}`, 
                    scadenza: "2026-12-31" 
                }

                // Logica di simulazione basata sull'ID
                if (p.id % 3 === 0) {
                    return { ...base, tipo: "Premium", serviziAccessori: p.id + 2 }
                } else {
                    return { ...base, tipo: "Standard", coperturaBase: p.id * 1000 }
                }
            })
            .filter(isPolizza);
    }
    catch (e) {
        console.log("Errore critico:", e)
        return [];
    }
}

async function generaReportAssicurativo(): Promise<void> {
    const polizze = await recuperaPolizze();

    const premium = polizze.filter(p => p.tipo === "Premium") as PolizzaPremium[];
    const standard = polizze.filter(p => p.tipo === "Standard") as PolizzaStandard[];

    console.log("--- REPORT ASSICURATIVO ---");

    console.log(`1. Totale Polizze: ${standard.length} Standard, ${premium.length} Premium`);

    const mediaServizi = premium.length > 0
        ? premium.reduce((s, p) => s + p.serviziAccessori, 0) / premium.length
        : 0;
    console.log(`2. Media Servizi Accessori (Premium): ${mediaServizi.toFixed(1)}`);

    console.log("3. Alert Coperture Standard Basse (< 3000€):");
    standard
        .filter(p => p.coperturaBase < 3000)
        .forEach(p => console.log(` - Cliente: ${p.codiceCliente} | Copertura: ${p.coperturaBase}€`));

    console.log("--- FINE REPORT ---");
}

generaReportAssicurativo();
