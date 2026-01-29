import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

// --- CONSTANTS (Static Config) ---
export const DAILY_PROTOCOL = [
    {
        name: "Stomach Vacuum",
        frequency: "Diariamente (em jejum)",
        execution: "Expire todo o ar, sugue o umbigo para dentro e para cima.",
        volume: "3 séries de 20 segundos (descanso de 30s)"
    }
];

export const WARMUP = [
    { name: "Alongamento de Peitoral na Porta", sets: 2, reps: "30 seg", notes: "Abre a caixa torácica" },
    { name: "Mobilidade de Ombros com Bastão", sets: 2, reps: "15 reps", notes: "Melhora lubrificação articular" }
];

// --- INITIAL DATA SEED ---
const INITIAL_WORKOUTS = [
    {
        id: 'a',
        userId: 'rafael',
        name: 'Treino A - Largura e Volume Superior',
        description: 'Foco: Criar o V-Taper (costas largas e ombros destacados)',
        color: 'blue',
        exercises: [
            { name: 'Agachamento ou Leg Press', sets: 3, reps: '10-12', notes: 'Pés ligeiramente mais afastados que ombros (fêmur longo)' },
            { name: 'Supino Inclinado (Halteres)', sets: 3, reps: '10', notes: 'Foque na porção superior. Escápulas travadas.' },
            { name: 'Puxada Vertical Aberta', sets: 3, reps: '10', notes: 'Cotovelos em direção aos bolsos laterais.' },
            { name: 'Elevação Lateral', sets: 4, reps: '15', notes: 'Suba até a altura dos ombros. Braços levemente flexionados.' },
            { name: 'Cadeira Flexora', sets: 3, reps: '12', notes: 'Controle a volta (excêntrica) para densidade.' },
            { name: 'Face Pull (Corda)', sets: 3, reps: '15', notes: 'Puxe em direção à testa (duplo bíceps).' },
        ]
    },
    {
        id: 'b',
        userId: 'rafael',
        name: 'Treino B - Densidade e Base Atlética',
        description: 'Foco: Espessura de costas e preenchimento de membros inferiores.',
        color: 'indigo',
        exercises: [
            { name: 'Stiff (RDL)', sets: 3, reps: '10', notes: 'Coluna neutra. Sinta alongamento posterior.' },
            { name: 'Cadeira Extensora', sets: 3, reps: '12', notes: 'Segure 1s no topo (ponto máximo de contração).' },
            { name: 'Remada Baixa (Triângulo)', sets: 3, reps: '10', notes: 'Abra o peito no final, esmague as escápulas.' },
            { name: 'Desenvolvimento (Halteres)', sets: 3, reps: '10', notes: 'Não deixe os ombros subirem até as orelhas.' },
            { name: 'Paralelas ou Supino Reto', sets: 3, reps: '10', notes: 'Prefira halteres no supino para amplitude.' },
            { name: 'Panturrilha em Pé', sets: 4, reps: '15', notes: 'Alongamento total e contração máxima.' },
        ]
    },
    {
        id: 'ja',
        userId: 'julyana',
        name: 'Treino A - Quadríceps (Segunda)',
        description: 'Foco: Volume bruto e densidade no vasto medial',
        color: 'emerald',
        exercises: [
            { name: 'Cadeira Extensora', sets: 4, reps: '15', notes: 'Pico de contração: Segure 2s no topo.' },
            { name: 'Agachamento Livre', sets: 4, reps: '8-10', notes: 'Força: Amplitude máxima (quebrar a paralela).' },
            { name: 'Leg Press 45°', sets: 3, reps: '12', notes: 'Pés baixos na plataforma para isolar quads.' },
            { name: 'Agachamento Búlgaro', sets: 3, reps: '10 (cada)', notes: 'Tronco ereto para focar na coxa frontal.' },
            { name: 'Panturrilha em Pé', sets: 5, reps: '15', notes: 'Cadência controlada (4s na descida).' },
        ]
    },
    {
        id: 'jb',
        userId: 'julyana',
        name: 'Treino B - Posterior e Glúteo (Quarta)',
        description: 'Foco: Profundidade do perfil e efeito pump',
        color: 'teal',
        exercises: [
            { name: 'Mesa Flexora', sets: 4, reps: '12-15', notes: 'Mantenha o quadril colado no banco.' },
            { name: 'Stiff (RDL)', sets: 4, reps: '10-12', notes: 'Essencial: Alongamento máximo do posterior.' },
            { name: 'Elevação Pélvica', sets: 4, reps: '8-10', notes: 'Explosão na subida e pausa no topo.' },
            { name: 'Cadeira Flexora', sets: 3, reps: '15', notes: 'Use descanso curto (45s) para gerar pump.' },
            { name: 'Cadeira Abdutora', sets: 3, reps: '20', notes: 'Foco no contorno lateral do glúteo médio.' },
        ]
    },
    {
        id: 'sup',
        userId: 'julyana',
        name: 'Superiores - Conjugado (Terça/Quinta)',
        description: 'Foco: Tônus, largura e postura (Bi-Sets)',
        color: 'cyan',
        exercises: [
            { name: 'Puxada Frente + Supino Halter', sets: 4, reps: '12 + 12', notes: 'Bi-set: Costas (largura) e Peitoral (tônus).' },
            { name: 'Desenvolvimento + Remada Baixa', sets: 3, reps: '12 + 12', notes: 'Bi-set: Ombros e Postura.' },
            { name: 'Tríceps Pulley + Rosca Direta', sets: 3, reps: '15 + 15', notes: 'Bi-set: Definição de braços.' },
            { name: 'Elevação Lateral', sets: 3, reps: 'Até a falha', notes: 'Isolado: Estética dos ombros.' },
        ]
    },
    {
        id: 'jc',
        userId: 'julyana',
        name: 'Treino C - Lapidação e Adutores (Sexta)',
        description: 'Foco: Precisão cirúrgica e correção de assimetrias',
        color: 'pink',
        exercises: [
            { name: 'Agachamento Sumô', sets: 4, reps: '12', notes: 'Pés abertos para focar nos adutores.' },
            { name: 'Cadeira Extensora (Unilat.)', sets: 3, reps: '12 (cada)', notes: 'Sem descanso entre as pernas (lapidação).' },
            { name: 'Flexora em Pé (Unilat.)', sets: 3, reps: '12 (cada)', notes: 'Isolamento total do posterior.' },
            { name: 'Leg Press Horizontal', sets: 3, reps: '15', notes: 'Pés altos na plataforma (glúteo/posterior).' },
            { name: 'Panturrilha (Bi-set)', sets: 4, reps: '15 + 15', notes: 'Sentada + Em pé sem descanso (exaustão).' },
        ]
    },
];

// --- FIRESTORE FUNCTIONS With MOCK Fallback ---

// Helper to seed data if empty
async function seedWorkoutsIfNeeded(userId) {
    if (!db) return; // Skip if no DB connection
    try {
        // Only seed if we are looking for rafael or julyana (initial users)
        const relevantSeed = INITIAL_WORKOUTS.filter(w => w.userId === userId);
        if (relevantSeed.length === 0) return;

        // Check if any workout exists for this user
        const q = query(collection(db, 'workouts'), where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`Seeding workouts for ${userId}...`);
            const p = relevantSeed.map(w => addDoc(collection(db, 'workouts'), w));
            await Promise.all(p);
        }
    } catch (e) {
        console.error("Error seeding database:", e);
        // Suppress error in case of missing internet/keys (fallback)
    }
}

export async function getWorkouts(userId) {
    try {
        await seedWorkoutsIfNeeded(userId);

        const q = query(collection(db, 'workouts'), where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Firebase Connect Error (getWorkouts):", error);
        // Fallback to initial data if firebase fails (e.g. no keys)
        return INITIAL_WORKOUTS.filter(w => w.userId === userId);
    }
}

export async function getWorkout(id) {
    try {
        const docRef = doc(db, 'workouts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }

        // Fallback check in valid IDs
        return INITIAL_WORKOUTS.find(w => w.id === id);
    } catch (error) {
        console.error("Firebase Connect Error (getWorkout):", error);
        return INITIAL_WORKOUTS.find(w => w.id === id);
    }
}

export async function saveWorkoutSession(sessionData) {
    if (!db) return { success: true };
    try {
        await addDoc(collection(db, 'sessions'), sessionData);
        return { success: true };
    } catch (error) {
        console.error("Firebase Save Error:", error);
        throw error;
    }
}

export async function getHistory(userId) {
    if (!db) return [];
    try {
        const q = query(collection(db, 'sessions'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Firebase Connect Error (getHistory):", error);
        return [];
    }
}

export async function getLastWeights(userId, workoutId) {
    if (!db) return {};
    try {
        const q = query(
            collection(db, 'sessions'),
            where('userId', '==', userId),
            where('workoutId', '==', workoutId)
        );
        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map(doc => doc.data());

        // Sort in memory because Firestore composite index might be missing
        sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sessions.length === 0) return {};

        const lastSession = sessions[0];
        const weights = {};
        lastSession.exercises.forEach(ex => {
            if (ex.weight && ex.weight !== '-') {
                weights[ex.name] = ex.weight;
            }
        });
        return weights;
    } catch (error) {
        console.error("Firebase Last Weights Error:", error);
        return {};
    }
}

export async function updateWorkout(workoutId, newWorkoutData) {
    if (!db) return { success: true };
    try {
        const docRef = doc(db, 'workouts', workoutId);
        await updateDoc(docRef, newWorkoutData);
        return { success: true };
    } catch (error) {
        console.error("Firebase Update Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createWorkout(userId) {
    if (!db) {
        return {
            id: 'mock-' + Date.now(),
            userId,
            name: 'Novo Treino Mock',
            exercises: []
        };
    }
    try {
        const newWorkout = {
            userId: userId,
            name: 'Novo Treino',
            description: 'Descrição do treino...',
            color: 'slate',
            exercises: []
        };
        const docRef = await addDoc(collection(db, 'workouts'), newWorkout);
        return { id: docRef.id, ...newWorkout };
    } catch (error) {
        console.error("Firebase Create Error:", error);
        throw error;
    }
}

export async function deleteSession(sessionId) {
    if (!db) return { success: true };
    try {
        await deleteDoc(doc(db, 'sessions', sessionId));
        return { success: true };
    } catch (error) {
        console.error("Firebase Delete Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getScore(userId) {
    if (!db) return 0;
    try {
        const q = query(collection(db, 'sessions'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map(d => d.data());

        let score = 0;

        sessions.forEach(session => {
            score += 100; // Base points

            const completedExercises = session.exercises.filter(e => e.completed).length;
            score += completedExercises * 10;

            const totalExercises = session.exercises.length;
            if (totalExercises > 0 && completedExercises === totalExercises) {
                score += 50;
            }
        });

        return score;
    } catch (error) {
        console.error("Firebase Score Error:", error);
        return 0;
    }
}
