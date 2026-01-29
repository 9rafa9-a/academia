import { getWorkout, WARMUP, getLastWeights } from '@/lib/db';
import WorkoutSession from '@/components/WorkoutSession';

export default async function WorkoutPage({ params }) {
    const { id } = await params;
    const workout = await getWorkout(id);

    if (!workout) return <div>Treino não encontrado</div>;

    const isRafael = workout.userId === 'rafael';
    const warmup = isRafael ? WARMUP : null;
    const lastWeights = await getLastWeights(workout.userId, workout.id);

    return <WorkoutSession workout={workout} warmup={warmup} lastWeights={lastWeights} />;
}
