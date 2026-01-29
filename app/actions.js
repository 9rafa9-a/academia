'use server';

import { saveWorkoutSession, updateWorkout, createWorkout, deleteSession } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveSessionAction(data) {
    await saveWorkoutSession(data);
    revalidatePath(`/dashboard/${data.userId}`);
    revalidatePath(`/dashboard/${data.userId}/history`); // Revalidate history page too
    return { success: true };
}

// ... existing actions ...

export async function deleteSessionAction(sessionId, userId) {
    await deleteSession(sessionId);
    revalidatePath(`/dashboard/${userId}`);
    revalidatePath(`/dashboard/${userId}/history`);
    return { success: true };
}

export async function updateWorkoutAction(workoutId, data) {
    await updateWorkout(workoutId, data);
    revalidatePath(`/workout/${workoutId}`);
    return { success: true };
}

export async function createWorkoutAction(userId) {
    const newWorkout = await createWorkout(userId);
    revalidatePath(`/dashboard/${userId}`);
    redirect(`/workout/${newWorkout.id}`);
}
