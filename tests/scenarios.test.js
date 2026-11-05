// Tests des mails générés par EasyResil.
//
// Lance la page dans un navigateur simulé (jsdom), joue des scénarios et vérifie
// l'objet et le corps du mail. La date du jour est figée au jeudi 5 novembre 2026
// pour que les règles (passé / aujourd'hui / futur / week-end) restent stables.
//
// Utilisation :
//   npm install        (une seule fois)
//   npm test           (résumé)
//   npm test -- -v     (affiche aussi chaque mail généré)

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('-v') || process.argv.includes('--verbose');
const FIXED_TODAY = [2026, 10, 5, 10, 0, 0]; // jeudi 5 novembre 2026, 10h

const PAST = '2026-11-01';     // dimanche passé
const TODAY = '2026-11-05';    // jeudi (jour ouvré)
const FUTURE = '2026-11-20';   // vendredi (jour ouvré)
const SATURDAY = '2026-11-21';
const HOLIDAY = '2026-11-11';  // Armistice (mercredi férié)

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/<script src="https:[^>]*><\/script>/g, '')
    .replace('<script src="app.js"></script>', '');
const flatpickrJs = fs.readFileSync(require.resolve('flatpickr/dist/flatpickr.min.js'), 'utf8');
const flatpickrFr = fs.readFileSync(require.resolve('flatpickr/dist/l10n/fr.js'), 'utf8');
const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

function render(setup) {
    const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
    const w = dom.window;
    w.eval(`(function () {
        const RealDate = Date;
        const fixed = new RealDate(${FIXED_TODAY.join(',')}).getTime();
        class FixedDate extends RealDate {
            constructor(...args) { if (args.length === 0) super(fixed); else super(...args); }
            static now() { return fixed; }
        }
        window.Date = FixedDate;
    })();`);
    w.eval(flatpickrJs);
    w.eval(flatpickrFr);
    w.eval(appJs);
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

    const $ = (id) => w.document.getElementById(id);
    const q = (sel) => w.document.querySelector(sel);
    const check = (sel) => {
        const el = sel.startsWith('#') || sel.startsWith('input') ? q(sel) : $(sel);
        el.checked = true;
        el.dispatchEvent(new w.Event('change', { bubbles: true }));
    };
    const date = (id, value) => $(id)._flatpickr.setDate(value, true);
    const clear = (energy) => $(`btn-clear-${energy}`).click();
    const type = (id, value) => {
        const el = $(id);
        el.value = value;
        el.dispatchEvent(new w.Event('input', { bubbles: true }));
    };

    setup({ check, date, clear, type });
    return {
        subject: $('email-subject-input').value,
        body: $('email-body-input').value,
        rules: $('rules-description').textContent,
    };
}

// Vérifications appliquées à tous les mails
const GLOBAL_CHECKS = [
    [/\.\.(?!\.)/, 'double point « .. »'],
    [/transmise sous réserve/, 'phrase contradictoire « transmise sous réserve »'],
    [/\[Date de RDV\], au lieu/, '« au lieu du … » sans date de RDV'],
    [/undefined|NaN|Invalid Date|\[object/, 'valeur technique dans le texte'],
    [/a été enregistré/, 'affirmation « a été enregistré »'],
    [/jour même de votre demande/, 'formulation ambiguë « jour même de votre demande »'],
];

const scenarios = [
    // --- Électricité seule
    { name: 'Élec, date future', setup: ({ date }) => date('cancel-date-elec', FUTURE),
      subject: ['Confirmation de la résiliation de votre contrat d\'électricité'], body: ['vendredi 20 novembre 2026'] },
    { name: 'Élec, date passée → aujourd\'hui', setup: ({ date }) => date('cancel-date-elec', PAST),
      body: ['de manière rétroactive', 'jeudi 5 novembre 2026'] },
    { name: 'Élec sans date', setup: ({ clear }) => clear('elec'),
      subject: ['Action requise : Date de résiliation'] },
    { name: 'Élec sans date + relève fournie', setup: ({ clear, check }) => { clear('elec'); check('meter-non-communicating'); check('elec-reading-provided'); },
      body: ['ainsi que votre relève de compteur'] },
    { name: 'Élec future, compteur non communicant + garder gaz',
      setup: ({ date, check }) => { date('cancel-date-elec', FUTURE); check('keep-active-other'); check('meter-non-communicating'); },
      subject: ['Relève de compteur à fournir', 'question pour votre contrat gaz'], body: ['à la date demandée'], bodyNot: ['facture de clôture'] },
    { name: 'Élec aujourd\'hui, non communicant sans relève',
      setup: ({ date, check }) => { date('cancel-date-elec', TODAY); check('meter-non-communicating'); },
      subject: ['🚨'], body: ['URGENT'] },

    // --- Gaz seul
    { name: 'Gaz aujourd\'hui → prochain jour ouvré', setup: ({ check, date }) => { check('#energy-gaz'); date('cancel-date-gaz', TODAY); },
      body: ['vendredi 6 novembre 2026'] },
    { name: 'Gaz un samedi → lundi', setup: ({ check, date }) => { check('#energy-gaz'); date('cancel-date-gaz', SATURDAY); },
      body: ['lundi 23 novembre 2026'] },
    { name: 'Gaz un jour férié → lendemain', setup: ({ check, date }) => { check('#energy-gaz'); date('cancel-date-gaz', HOLIDAY); },
      body: ['jour férié', 'jeudi 12 novembre 2026'] },
    { name: 'Gaz sans date + RDV coché → pas de paragraphe RDV',
      setup: ({ check, clear }) => { check('#energy-gaz'); check('gaz-appointment-needed'); clear('gaz'); },
      bodyNot: ['Ce rendez-vous est programmé'] },
    { name: 'Gaz RDV sans date de RDV', setup: ({ check, date }) => { check('#energy-gaz'); date('cancel-date-gaz', FUTURE); check('gaz-appointment-needed'); },
      subject: ['Rendez-vous obligatoire'] },
    { name: 'Gaz RDV avant la date souhaitée → alerte',
      setup: ({ check, date }) => { check('#energy-gaz'); date('cancel-date-gaz', FUTURE); check('gaz-appointment-needed'); date('gaz-appointment-date', '2026-11-12'); },
      rules: ['AVANT la date de résiliation souhaitée'] },
    { name: 'Gaz RDV passé → alerte',
      setup: ({ check, date }) => { check('#energy-gaz'); date('cancel-date-gaz', FUTURE); check('gaz-appointment-needed'); date('gaz-appointment-date', '2026-11-02'); },
      rules: ['dans le passé'] },

    // --- Élec + Gaz
    { name: 'Les deux, même date passée + RDV + non communicant sans relève',
      setup: ({ check, date }) => { check('#energy-both'); date('cancel-date-elec', PAST); date('cancel-date-gaz', PAST); check('meter-non-communicating'); check('gaz-appointment-needed'); date('gaz-appointment-date', '2026-11-10'); },
      subject: ['Rendez-vous obligatoire', '🚨'], body: ['de manière rétroactive', 'sous réserve que vous me transmettiez'] },
    { name: 'Les deux, même date future + RDV + non communicant',
      setup: ({ check, date }) => { check('#energy-both'); date('cancel-date-elec', FUTURE); date('cancel-date-gaz', FUTURE); check('meter-non-communicating'); check('gaz-appointment-needed'); date('gaz-appointment-date', '2026-11-24'); },
      subject: ['Rendez-vous obligatoire', 'Relève de compteur à fournir'] },
    { name: 'Les deux, dates distinctes, élec aujourd\'hui sans relève → objet urgent',
      setup: ({ check, date }) => { check('#energy-both'); date('cancel-date-elec', TODAY); date('cancel-date-gaz', FUTURE); check('meter-non-communicating'); },
      subject: ['🚨'] },
    { name: 'Les deux, dates distinctes, gaz un samedi',
      setup: ({ check, date }) => { check('#energy-both'); date('cancel-date-elec', FUTURE); date('cancel-date-gaz', SATURDAY); },
      body: ['lundi 23 novembre 2026'] },
    { name: 'Les deux, élec future + relève, gaz vide',
      setup: ({ check, date, clear }) => { check('#energy-both'); date('cancel-date-elec', FUTURE); clear('gaz'); check('meter-non-communicating'); check('elec-reading-provided'); },
      subject: ['date de résiliation gaz à préciser'], bodyNot: ['facture de clôture'] },

    // --- Mise en service en cours
    { name: 'Mise en service élec future', setup: ({ check, date }) => { check('commissioning-in-progress'); date('cancel-date-elec', FUTURE); },
      body: ['est prévue le vendredi 20 novembre 2026 pour le futur occupant des lieux', 'elle se fera automatiquement lors de cette mise en service.'] },
    { name: 'Mise en service élec passée → déjà résilié', setup: ({ check, date }) => { check('commissioning-in-progress'); date('cancel-date-elec', PAST); },
      subject: ['Résiliation automatique'], body: ['a déjà eu lieu', 'est intervenue automatiquement'] },
    // Mise en service sur une seule énergie (Élec + Gaz) : l'autre énergie suit les règles normales
    ...partialScenarios(),
];

function partialScenarios() {
    const list = [];
    const setupBase = (scope) => ({ check }) => {
        check('#energy-both');
        check('commissioning-in-progress');
        check(`input[name="commissioning-scope"][value="${scope}"]`);
    };
    const common = (commLabel, otherLabel) => ({
        body: [`Concernant votre contrat ${commLabel} : je constate qu'une mise en service`, `Concernant votre contrat ${otherLabel} : `],
        // pas d'introduction répétée dans la partie de l'autre énergie
        bodyNot: ['\n✅ Je vous confirme', 'pour votre contrat d', ' : Cependant', ' : cependant'],
    });

    // Mise en service élec, gaz résilié normalement
    const gazCases = [
        ['gaz passé', ({ date }) => date('cancel-date-gaz', PAST), ['de manière rétroactive', 'vendredi 6 novembre 2026']],
        ['gaz aujourd\'hui', ({ date }) => date('cancel-date-gaz', TODAY), ['vendredi 6 novembre 2026']],
        ['gaz futur', ({ date }) => date('cancel-date-gaz', FUTURE), ['vendredi 20 novembre 2026']],
        ['gaz samedi', ({ date }) => date('cancel-date-gaz', SATURDAY), ['lundi 23 novembre 2026']],
        ['gaz férié', ({ date }) => date('cancel-date-gaz', HOLIDAY), ['jeudi 12 novembre 2026']],
        ['gaz sans date', ({ clear }) => clear('gaz'), ['je constate que vous n\'avez pas indiqué la date']],
        ['gaz avec RDV', ({ date, check }) => { date('cancel-date-gaz', FUTURE); check('gaz-appointment-needed'); date('gaz-appointment-date', '2026-11-24'); }, ['mardi 24 novembre 2026', 'Ce rendez-vous est programmé']],
    ];
    const elecCommDates = [
        ['MES élec datée', ({ date }) => date('cancel-date-elec', FUTURE), 'est prévue le vendredi 20 novembre 2026'],
        ['MES élec sans date', ({ clear }) => clear('elec'), 'est prévue pour le futur occupant des lieux'],
        ['MES élec passée', ({ date }) => date('cancel-date-elec', PAST), 'a déjà eu lieu le dimanche 1 novembre 2026'],
    ];
    for (const [commName, commSetup, commText] of elecCommDates) {
        for (const [name, setup, texts] of gazCases) {
            const c = common("d'électricité", 'de gaz');
            list.push({
                name: `${commName} + ${name}`,
                setup: (h) => { setupBase('elec')(h); commSetup(h); setup(h); },
                body: [...c.body, commText, ...texts], bodyNot: c.bodyNot,
                subject: [commName.includes('passée') ? 'Résiliation automatique (électricité)' : 'Mise en service prévue (électricité)'],
            });
        }
    }

    // Mise en service gaz, électricité résiliée normalement
    const elecCases = [
        ['élec passée', ({ date }) => date('cancel-date-elec', PAST), ['de manière rétroactive', 'jeudi 5 novembre 2026']],
        ['élec aujourd\'hui', ({ date }) => date('cancel-date-elec', TODAY), ['jeudi 5 novembre 2026']],
        ['élec future', ({ date }) => date('cancel-date-elec', FUTURE), ['vendredi 20 novembre 2026']],
        ['élec samedi (pas de report)', ({ date }) => date('cancel-date-elec', SATURDAY), ['samedi 21 novembre 2026']],
        ['élec sans date', ({ clear }) => clear('elec'), ['je constate que vous n\'avez pas indiqué la date']],
        ['élec aujourd\'hui, non communicant sans relève', ({ date, check }) => { date('cancel-date-elec', TODAY); check('meter-non-communicating'); }, ['URGENT']],
        ['élec aujourd\'hui, non communicant avec relève', ({ date, check, type }) => { date('cancel-date-elec', TODAY); check('meter-non-communicating'); check('elec-reading-provided'); type('reading-base-val', '12345'); }, ['sur la base de la relève', '12345']],
        ['élec future, non communicant avec relève', ({ date, check }) => { date('cancel-date-elec', FUTURE); check('meter-non-communicating'); check('elec-reading-provided'); }, ['📸', 'nouvelle relève à cette date.']],
        ['élec sans date, non communicant avec relève', ({ clear, check }) => { clear('elec'); check('meter-non-communicating'); check('elec-reading-provided'); }, ["j'ai bien reçu votre relève de compteur"]],
    ];
    const gazCommDates = [
        ['MES gaz datée', ({ date }) => date('cancel-date-gaz', FUTURE), 'est prévue le vendredi 20 novembre 2026'],
        ['MES gaz sans date', ({ clear }) => clear('gaz'), 'est prévue pour le futur occupant des lieux'],
    ];
    for (const [commName, commSetup, commText] of gazCommDates) {
        for (const [name, setup, texts] of elecCases) {
            const c = common('de gaz', "d'électricité");
            list.push({
                name: `${commName} + ${name}`,
                setup: (h) => { setupBase('gaz')(h); commSetup(h); setup(h); },
                body: [...c.body, commText, ...texts], bodyNot: c.bodyNot,
                subject: ['Mise en service prévue (gaz)'],
            });
        }
    }
    return list;
}

let failures = 0;
for (const sc of scenarios) {
    let out;
    const errors = [];
    try {
        out = render(sc.setup);
    } catch (e) {
        errors.push(`erreur JavaScript : ${e.message}`);
    }
    if (out) {
        for (const [re, label] of GLOBAL_CHECKS) {
            if (re.test(out.body) || re.test(out.subject)) errors.push(label);
        }
        for (const s of sc.subject || []) if (!out.subject.includes(s)) errors.push(`objet sans « ${s} »`);
        for (const s of sc.body || []) if (!out.body.includes(s)) errors.push(`corps sans « ${s} »`);
        for (const s of sc.bodyNot || []) if (out.body.includes(s)) errors.push(`corps contient « ${s} »`);
        for (const s of sc.rules || []) if (!out.rules.includes(s)) errors.push(`bandeau sans « ${s} »`);
    }

    if (errors.length) {
        failures++;
        console.log(`✗ ${sc.name}\n    - ${errors.join('\n    - ')}`);
    } else {
        console.log(`✓ ${sc.name}`);
    }
    if (VERBOSE && out) {
        console.log(`    OBJET : ${out.subject}\n    RÈGLES : ${out.rules}\n${out.body.replace(/^/gm, '    | ')}\n`);
    }
}

console.log(`\n${scenarios.length - failures}/${scenarios.length} scénarios OK`);
process.exit(failures ? 1 : 0);
