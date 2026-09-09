"use client";

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Box, Flex, VStack, Text, Image, useToast, Spinner
} from "@chakra-ui/react";
import { FileText, CheckCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PAGE_LAYOUT,
  HEADER_SPACE_MM,
  FOOTER_SPACE_MM,
  LETTER_CONTENT_CSS,
  buildLetterContentHtml,
} from "@/components/lib/pdfLayout";
import { paginateHtml, wrapTableHeaderRowsInHtml } from "@/components/lib/paginateHtml";

export type PreviewModalMode = "default" | "preview_previa_s_r" | "approve";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoSolicitud: string;
  modeloCarta: string;
  generalData: any;
  codigoFormato?: string;
  mode?: PreviewModalMode;
  onConfirmApprove?: () => Promise<void>;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  tipoSolicitud,
  modeloCarta,
  generalData,
  codigoFormato = "CODIGO FORMATO",
  mode = "default",
  onConfirmApprove
}: PreviewModalProps) {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);

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

  const fullContentHtml = useMemo(() => {
    if (!isOpen) return "";
    const cuerpoFormateado = parseContenidoPreview(modeloCarta)
      .replace(/style="text-align:\s*right;?"/g, 'class="text-right"')
      .replace(/style="text-align:\s*center;?"/g, 'class="text-center"')
      .replace(/style="text-align:\s*justify;?"/g, 'class="text-justify"');

    return buildLetterContentHtml({
      codigoFormato,
      fecha: getFechaFormateada(),
      cuerpoFormateado,
      directorNombre: generalData?.director?.director_extension,
      directorCargo: generalData?.director?.cargo,
    });
  }, [isOpen, modeloCarta, codigoFormato, generalData]);

  useEffect(() => {
    if (!isOpen || !fullContentHtml) {
      setPages([]);
      setIsLoadingPagination(false);
      return;
    }

    setIsLoadingPagination(true);

    const id = requestAnimationFrame(() => {
      const result = paginateHtml(fullContentHtml);
      setPages(result);
      setIsLoadingPagination(false);
    });

    return () => cancelAnimationFrame(id);
  }, [isOpen, fullContentHtml]);

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

      const contentHtml = wrapTableHeaderRowsInHtml(
        buildLetterContentHtml({
          codigoFormato,
          fecha,
          cuerpoFormateado,
          directorNombre: generalData?.director?.director_extension,
          directorCargo: generalData?.director?.cargo,
        })
      );

      const htmlCompletoParaPDF = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page {
              size: letter;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page-container {
              padding-left: ${PAGE_LAYOUT.MARGIN_X_MM}mm;
              padding-right: ${PAGE_LAYOUT.MARGIN_X_MM}mm;
            }
            .header-space { height: ${HEADER_SPACE_MM}mm; }
            .footer-space { height: ${FOOTER_SPACE_MM}mm; }

            .table-print-layout,
            .table-print-layout > thead > tr > td,
            .table-print-layout > tbody > tr > td,
            .table-print-layout > tfoot > tr > td {
              border: none !important;
              padding: 0 !important;
              background-color: transparent !important;
            }

            .header {
              position: fixed;
              top: ${PAGE_LAYOUT.HEADER_TOP_MM}mm;
              left: ${PAGE_LAYOUT.MARGIN_X_MM}mm;
              right: ${PAGE_LAYOUT.MARGIN_X_MM}mm;
              text-align: center;
              background-color: white;
            }
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
              bottom: ${PAGE_LAYOUT.FOOTER_BOTTOM_MM}mm;
              left: ${PAGE_LAYOUT.MARGIN_X_MM}mm;
              right: ${PAGE_LAYOUT.MARGIN_X_MM}mm;
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
            p { margin-bottom: 10px; margin-top: 0; }

            ${LETTER_CONTENT_CSS}
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
                      ${contentHtml}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot><tr><td><div class="footer-space">&nbsp;</div></td></tr></tfoot>
          </table>

          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <img src="${ucvBase64}" height="55" alt="UCV Logo" />
              <img src="${gsuBase64}" height="50" alt="GSU Logo" />
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
          {!isLoadingPagination && pages.length > 0 && (
            <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal" ml={2}>
              ({pages.length} {pages.length === 1 ? "página" : "páginas"})
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody bg="gray.300" py={6} display="flex" flexDirection="column" alignItems="center" minH="400px" justifyContent={isLoadingPagination ? "center" : "flex-start"}>
          {/* Estilos de contenido */}
          <style dangerouslySetInnerHTML={{ __html: LETTER_CONTENT_CSS }} />

          {isLoadingPagination ? (
            <VStack spacing={4} py={12}>
              <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Cargando...</Text>
            </VStack>
          ) : (
            pages.map((pageHtml, idx) => (
              <Box
                key={idx}
                bg="white"
                w={`${PAGE_LAYOUT.PAGE_WIDTH_MM}mm`}
                h={`${PAGE_LAYOUT.PAGE_HEIGHT_MM}mm`}
                flexShrink={0}
                boxShadow="2xl"
                position="relative"
                overflow="hidden"
                mb={8}
                sx={{ "& *": { fontFamily: "Arial, sans-serif !important" } }}
              >
                {/* Encabezado */}
                <Box
                  position="absolute"
                  top={`${PAGE_LAYOUT.HEADER_TOP_MM}mm`}
                  left={`${PAGE_LAYOUT.MARGIN_X_MM}mm`}
                  right={`${PAGE_LAYOUT.MARGIN_X_MM}mm`}
                  textAlign="center"
                >
                  <Flex justify="space-between" align="center" mb={1}>
                    <Image src="/UCV.png" h="55px" objectFit="contain" alt="Logo UCV" />
                    <Image src="/logo.png" h="50px" objectFit="contain" alt="Logo GSU" />
                  </Flex>
                  <Text fontWeight="bold" fontSize="11pt" borderBottom="2px solid black" pb="5px">
                    UNIVERSIDAD CENTRAL DE VENEZUELA
                  </Text>
                  <Text fontWeight="bold" fontSize="9pt" color="gray.600" mt="5px">
                    DIRECCIÓN DE EXTENSIÓN UNIVERSITARIA
                  </Text>
                </Box>

                {/* Zona de contenido */}
                <Box
                  position="absolute"
                  top={`${HEADER_SPACE_MM}mm`}
                  left={`${PAGE_LAYOUT.MARGIN_X_MM}mm`}
                  right={`${PAGE_LAYOUT.MARGIN_X_MM}mm`}
                  bottom={`${FOOTER_SPACE_MM}mm`}
                  overflow="hidden"
                  fontSize="11pt"
                  lineHeight="1.6"
                  textAlign="justify"
                  className="rich-text-preview"
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />

                {/* Pie de página */}
                <Box
                  position="absolute"
                  bottom={`${PAGE_LAYOUT.FOOTER_BOTTOM_MM}mm`}
                  left={`${PAGE_LAYOUT.MARGIN_X_MM}mm`}
                  right={`${PAGE_LAYOUT.MARGIN_X_MM}mm`}
                  borderTop="1px solid"
                  borderColor="gray.300"
                  pt={2}
                  textAlign="center"
                >
                  <Text fontWeight="bold" fontSize="8.5pt" color="gray.700">{generalData?.pie_pagina}</Text>
                  <Text fontSize="8pt" color="gray.500">{generalData?.info}</Text>
                </Box>

                <Text position="absolute" bottom="5mm" right={`${PAGE_LAYOUT.MARGIN_X_MM}mm`} fontSize="7pt" color="gray.400">
                  Página {idx + 1} de {pages.length}
                </Text>
              </Box>
            ))
          )}
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
                isDisabled={isLoadingPagination}
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
                bg="secondary"
                color="white"
                _hover={{ filter: "brightness(0.9)" }}
                onClick={handleDownloadPDF}
                isLoading={isDownloading}
                isDisabled={isLoadingPagination}
                loadingText="Generando PDF"
              >
                Descargar Documento PDF (.pdf)
              </Button>
              <Button bg="danger" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={onClose} ml="auto">
                Cerrar Inspección
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
