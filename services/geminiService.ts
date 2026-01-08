import { ProjectType } from "../types";

// Use lazy initialization to prevent crashes on startup
export const generateProductionPlan = async (
  projectType: ProjectType,
  client: string,
  deliveryDate: string,
  briefingAnswers: Record<string, string>
) => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectType,
        client,
        deliveryDate,
        briefingAnswers
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const getBriefingQuestions = (type: ProjectType) => {
  const baseQuestions = [
    { id: 'location', question: 'Qual o local principal da captação?', type: 'text' },
    { id: 'hours', question: 'Quantas horas estimadas de captação?', type: 'number' },
    { id: 'deliverables', question: 'Qual o formato final da entrega (ex: 4K, Reels, Horizontal)?', type: 'text' },
    { id: 'crew', question: 'Tamanho da equipe necessário?', type: 'number' },
    { id: 'reference', question: 'Link de referência ou estilo visual desejado?', type: 'text' }
  ];

  return baseQuestions;
};
