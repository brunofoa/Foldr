import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ProjectType } from "../types";

// Use lazy initialization to prevent crashes on startup
export const generateProductionPlan = async (
  projectType: ProjectType,
  client: string,
  deliveryDate: string,
  briefingAnswers: Record<string, string>
) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env.local");
    throw new Error("Configuração de IA ausente. Verifique a chave de API.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // gemini-1.5-flash is stable and recommended
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          steps: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                phase: {
                  type: SchemaType.STRING,
                  format: "enum",
                  enum: ["Pré", "Produção", "Pós"]
                },
                dueDate: { type: SchemaType.STRING }
              },
              required: ["id", "title", "phase", "dueDate"]
            }
          },
          checklist: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                category: {
                  type: SchemaType.STRING,
                  format: "enum",
                  enum: ["Equipamento", "Captação", "Backup", "Edição", "Entrega"]
                }
              },
              required: ["id", "title", "category"]
            }
          },
          alerts: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                message: { type: SchemaType.STRING },
                type: {
                  type: SchemaType.STRING,
                  format: "enum",
                  enum: ["warning", "info", "critical"]
                }
              },
              required: ["id", "message", "type"]
            }
          }
        },
        required: ["steps", "checklist", "alerts"]
      }
    }
  });

  const prompt = `
    Aja como um produtor audiovisual experiente. Crie um plano de produção detalhado e prático para um projeto do tipo ${projectType}.
    Cliente: ${client}
    Data de Entrega Final: ${deliveryDate}
    Briefing Complementar: ${JSON.stringify(briefingAnswers)}

    Requisitos Obrigatórios:
    1. PLANO DE PRODUÇÃO: Gere etapas lógicas divididas estritamente em "Pré", "Produção" e "Pós". Certifique-se de incluir datas de vencimento lógicas até a data de entrega.
    
    2. CHECKLIST DE CAMPO: Gere itens DE 2 A 5 ITENS para CADA UMA das seguintes categorias:
       - Equipamento (ex: Câmeras, Lentes, Luz)
       - Captação (ex: Lista de Takes, Áudio)
       - Backup (ex: HDs, Cartões, Cópia em Nuvem)
       - Edição (ex: Decupagem, Trilha, Color)
       - Entrega (ex: Formatos, Upload, Link)
    
    3. ALERTAS: Gere alertas de possíveis gargalos ou atenções especiais para este tipo de projeto.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
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
