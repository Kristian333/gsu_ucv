"use client";

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Box, Flex, VStack, Text, Image, useToast
} from "@chakra-ui/react";
import { FileText, CheckCircle } from "lucide-react";
import { useState } from "react";

export type PreviewModalMode = "default" | "preview_previa_s_r" | "approve";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoSolicitud: string;
  modeloCarta: string;
  generalData: any;
  mode?: PreviewModalMode;
  onConfirmApprove?: () => Promise<void>;
}

export default function TemplatePreviewModal({ 
  isOpen, 
  onClose, 
  tipoSolicitud, 
  modeloCarta, 
  generalData,
  mode = "default",
  onConfirmApprove
}: PreviewModalProps) {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  const getFechaFormateada = () => {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const hoy = new Date();
    return `Caracas, ${String(hoy.getDate()).padStart(2, '0')} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
  };

  const parseContenidoPreview = (htmlString: string) => {
    if (!htmlString) return "";
    return htmlString.replace(/{{([^}]+)}}/g, (match, contenido) => {
      return `<span style="background-color: #feebc8; color: #c05621; padding: 2px 4px; border-radius: 4px; font-weight: bold; font-size: 9.5pt;">[${contenido.trim()}]</span>`;
    });
  };

  // Función nativa y limpia para generar y descargar el archivo compatible con Word MS
  const getBase64Image = async (src: string): Promise<string> => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return "";
    }
  };

   const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const fecha = getFechaFormateada();
      const ucvBase64 = await getBase64Image("/UCV.png");
      const gsuBase64 = await getBase64Image("/logo.png");

      const cuerpoFormateado = parseContenidoPreview(modeloCarta)
        .replace(/style="text-align:\s*right;?"/g, 'class="text-right"')
        .replace(/style="text-align:\s*center;?"/g, 'class="text-center"')
        .replace(/style="text-align:\s*justify;?"/g, 'class="text-justify"');
     
      // Estructura maestra HTML que procesará Puppeteer en el servidor
      const htmlCompletoParaPDF = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page {
              size: letter;
              margin: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            .page-container {
              padding-left: 2.54cm;
              padding-right: 2.54cm;
            }
            .header-space { height: 160px; }
            .footer-space { height: 100px; }
            
            /* Eliminación estricta de bordes en la tabla de impresión base */
            .table-print-layout, .table-print-layout td, .table-print-layout th {
              border: none !important;
              padding: 0 !important;
              background-color: transparent !important;
            }
            
            .header {
              position: fixed;
              top: 2.0cm; left: 2.54cm; right: 2.54cm;
              height: 120px;
              text-align: center;
              background-color: white;
            }
            
            /* Ajuste de línea divisoria de diseño institucional */
            .header-brand-title {
              font-weight: bold; 
              font-size: 11pt; 
              letter-spacing: 0.5px;
              border-bottom: 2px solid #000000;
              padding-bottom: 5px;
            }
            .header-brand-subtitle {
              font-weight: bold; 
              font-size: 9pt; 
              color: #4a5568; 
              margin-top: 5px;
            }

            .footer {
              position: fixed;
              bottom: 1.5cm; left: 2.54cm; right: 2.54cm;
              height: 70px;
              border-top: 1px solid #cbd5e0;
              text-align: center;
              font-size: 8.5pt;
              background-color: white;
            }
            .content-body {
              font-size: 11pt;
              line-height: 1.6;
              text-align: justify;
            }
            
            /* Estilos para las tablas reales internas creadas en Tiptap */
            .content-body table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .content-body th, .content-body td { border: 1px solid #cbd5e0; padding: 8px; font-size: 10.5pt; }
            .content-body th { background-color: #f7fafc !important; font-weight: bold; }
            p { margin-bottom: 10px; margin-top: 0; }
            
            /* Clases explícitas para procesar alineaciones guardadas en el JSON */
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .text-justify { text-align: justify !important; }
          </style>
        </head>
        <body>
          <table class="table-print-layout" width="100%" cellspacing="0" cellpadding="0">
            <thead><tr><td><div class="header-space">&nbsp;</div></td></tr></thead>
            <tbody>
              <tr>
                <td>
                  <div class="page-container">
                    <div class="content-body">
                      <p><strong>DEU-GSU / FORMATO OFICIAL</strong></p>
                      <p class="text-right">${fecha}</p>
                      <br/>
                      <div>${cuerpoFormateado}</div>
                      <br/><br/>
                      <p>Atentamente,</p>
                      <br/><br/><br/>
                      <div style="width: 300px; margin: 0 auto; text-align: center; page-break-inside: avoid;">
                        <div style="border-top: 1.5px solid black; padding-top: 5px;">
                          <strong>${generalData?.director?.director_extension}</strong><br/>
                          <span style="font-size: 10pt; font-weight: bold;">${generalData?.director?.cargo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot><tr><td><div class="footer-space">&nbsp;</div></td></tr></tfoot>
          </table>

          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <img src="${ucvBase64}" height="55" alt="UCV" />
              <img src="${gsuBase64}" height="50" alt="GSU" />
            </div>
            <div class="header-brand-title">UNIVERSIDAD CENTRAL DE VENEZUELA</div>
            <div class="header-brand-subtitle">DIRECCIÓN DE EXTENSIÓN UNIVERSITARIA</div>
          </div>

          <div class="footer">
            <p style="margin: 5px 0 2px 0;"><strong>${generalData?.pie_pagina || ""}</strong></p>
            <p style="margin: 0; color: #718096; font-size: 8pt;">${generalData?.info || ""}</p>
          </div>
        </body>
        </html>
      `;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: htmlCompletoParaPDF }),
      });

      if (!response.ok) throw new Error("Error en servidor PDF");

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `Formato_${tipoSolicitud.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      toast({ title: "PDF Generado", description: "El documento se descargó correctamente.", status: "success" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo compilar el archivo PDF.", status: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  // Acción del modo de aprobación: Descarga el PDF y envía la confirmación de aprobación al backend
  const handleApproveAndDownload = async () => {
    setIsApproving(true);
    try {
      await handleDownloadPDF();
      if (onConfirmApprove) {
        await onConfirmApprove();
      }
      onClose();
    } catch (error) {
      console.error("Error al aprobar y descargar:", error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100" fontSize="md">
          Vista Previa (Tamaño Carta) — {tipoSolicitud || "Nuevo Formato"}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody bg="gray.300" py={6} display="flex" justifyContent="center">
          {/* HOJA SIMULADA TAMAÑO CARTA EN PANTALLA */}
          <Box 
            bg="white" 
            w="215.9mm" 
            minH="279.4mm"
            boxShadow="2xl"
            position="relative"
            p="25.4mm"
            sx={{ 
              "& *": { fontFamily: "Arial, sans-serif !important" },
              ".rich-text-preview table": { width: "100%", borderCollapse: "collapse", margin: "14px 0" },
              ".rich-text-preview th, .rich-text-preview td": { border: "1px solid #cbd5e0", padding: "8px", fontSize: "10.5pt" },
              ".rich-text-preview th": { backgroundColor: "#f7fafc", fontWeight: "bold" }
            }}
          >
            {/* Encabezado en Preview */}
            <Box pb={2} mb={6} textAlign="center">
              <Flex justify="space-between" align="center" mb={1}>
                <Image src="/UCV.png" h="55px" objectFit="contain" />
                <Image src="/logo.png" h="50px" objectFit="contain" />
              </Flex>
              <Text fontWeight="bold" fontSize="11pt" borderBottom="2px solid black" pb="5px">
                UNIVERSIDAD CENTRAL DE VENEZUELA
              </Text>
              <Text fontWeight="bold" fontSize="9pt" color="gray.600" mt="5px">
                DIRECCIÓN DE EXTENSIÓN UNIVERSITARIA
              </Text>
            </Box>

            {/* Contenido */}
            <Box>
              <Text fontWeight="bold" fontSize="11pt" mb={1}>DEU-GSU / FORMATO OFICIAL</Text>
              <Text textAlign="right" fontSize="11pt" mb={6}>{getFechaFormateada()}</Text>

              <Box 
                textAlign="justify" 
                fontSize="11pt" 
                lineHeight="1.6"
                className="rich-text-preview"
                  dangerouslySetInnerHTML={{ __html: parseContenidoPreview(modeloCarta) }}
              />

              <Box mt={10} style={{ pageBreakInside: "avoid" }}>
                <Text mb={14}>Atentamente,</Text>
                <VStack spacing={0} align="center" w="300px" mx="auto">
                  <Box borderTop="1.5px solid black" w="full" mb={2} />
                  <Text fontWeight="bold" fontSize="11pt">{generalData?.director?.director_extension}</Text>
                  <Text fontWeight="bold" fontSize="10pt" color="gray.600">
                    {generalData?.director?.cargo}
                  </Text>
                </VStack>
              </Box>
            </Box>

            {/* Pie de página */}
            <Box 
              position="absolute"
              bottom="15mm" left="25.4mm" right="25.4mm"
              borderTop="1px solid" borderColor="gray.300" pt={2} textAlign="center"
            >
              <Text fontWeight="bold" fontSize="8.5pt" color="gray.700">{generalData?.pie_pagina}</Text>
              <Text fontSize="8pt" color="gray.500">{generalData?.info}</Text>
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          {mode === "preview_previa_s_r" && (
            <Button bg="secondary" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={onClose} ml="auto">
              Cerrar
            </Button>
          )}

          {mode === "approve" && (
            <Flex w="full" justify="space-between" align="center">
              <Button variant="ghost" onClick={onClose} isDisabled={isApproving}>
                Cancelar
              </Button>
              <Button 
                leftIcon={<CheckCircle size={16} />} 
                bg="primary" 
                color="white"
                _hover={{ filter: "brightness(0.9)" }} 
                onClick={handleApproveAndDownload}
                isLoading={isApproving || isDownloading}
                loadingText="Procesando"
              >
                Aprobar y Descargar
              </Button>
            </Flex>
          )}

          {mode === "default" && (
            <>
          <Button 
            leftIcon={<FileText size={16} />} 
                bg="danger" 
                color="white"
                _hover={{ filter: "brightness(0.9)" }} 
            onClick={handleDownloadPDF}
            isLoading={isDownloading}
            loadingText="Generando PDF"
          >
            Descargar Documento PDF (.pdf)
          </Button>
              <Button bg="primary" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={onClose} ml="auto">
                Cerrar Inspección
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}