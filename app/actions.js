'use server';

import { saveWorkoutSession, updateWorkout, createWorkout, deleteSession, deleteWorkout, resetHistory } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ... existing actions ...

export async function deleteWorkoutAction(workoutId, userId) {
    await deleteWorkout(workoutId);
    revalidatePath(`/dashboard/${userId}`);
    redirect(`/dashboard/${userId}`);
}

export async function resetHistoryAction(userId) {
    await resetHistory(userId);
    revalidatePath(`/dashboard/${userId}`);
    revalidatePath(`/dashboard/${userId}/history`);
    return { success: true };
}

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

export async function updateWorkoutAction(workoutId, data, userId) {
    await updateWorkout(workoutId, data);
    revalidatePath(`/workout/${workoutId}`);
    if (userId) revalidatePath(`/dashboard/${userId}`);
    return { success: true };
}

export async function createWorkoutAction(userId) {
    const newWorkout = await createWorkout(userId);
    revalidatePath(`/dashboard/${userId}`);
    redirect(`/workout/${newWorkout.id}`);
}
