import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateProfessionalPDF, generateSimplePDF, DocumentMetadata } from './pdfGenerator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      markdown, 
      metadata, 
      style 
    }: { 
      markdown: string; 
      metadata: DocumentMetadata; 
      style?: any 
    } = await req.json();

    if (!markdown || !metadata) {
      throw new Error('markdown and metadata are required');
    }

    console.log('📄 Génération PDF:', metadata.type, metadata.title);

    const pdfBytes = await generateProfessionalPDF(markdown, metadata, style);

    console.log(`✅ PDF généré: ${(pdfBytes.length / 1024).toFixed(2)} KB`);

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${metadata.type}_${Date.now()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
