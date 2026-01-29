'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, Calendar } from 'lucide-react';

export default function ReportButton({ history, userName }) {

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text(`Relatório de Treinos - ${userName}`, 14, 22);

        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

        // Transform data for table
        // We want a list of all exercises performed
        const tableBody = [];

        history.forEach(session => {
            const date = new Date(session.date).toLocaleDateString('pt-BR');
            session.exercises.forEach(ex => {
                if (ex.completed || ex.weight !== '-') {
                    tableBody.push([
                        date,
                        session.workoutName,
                        ex.name,
                        ex.sets,
                        ex.reps,
                        ex.weight
                    ]);
                }
            });
        });

        if (tableBody.length === 0) {
            alert("Nenhum histórico encontrado para gerar relatório.");
            return;
        }

        autoTable(doc, {
            head: [['Data', 'Treino', 'Exercício', 'Séries', 'Reps', 'Carga (kg)']],
            body: tableBody,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }, // Blue header
        });

        doc.save(`relatorio_${userName}.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="flex flex-col items-center gap-1 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors w-full"
        >
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <FileDown size={24} />
            </div>
            <span className="text-sm font-medium text-slate-300">Baixar Relatório</span>
        </button>
    );
}
