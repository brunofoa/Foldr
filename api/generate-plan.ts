import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
    runtime: 'edge', // Using Edge runtime for better performance, or remove if Node is preferred
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { projectType, client, deliveryDate, briefingAnswers } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return new Response(text, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("AI Generation Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to generate plan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
