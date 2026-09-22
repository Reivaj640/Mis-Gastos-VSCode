"use client";

import { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { APP_VERSION } from "@/lib/version";
import {
  registerServiceWorker,
  applyUpdateFromFile,
  getCurrentVersion,
} from "@/lib/updater";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => Promise<void>;
      installUpdate: () => void;
      onUpdateAvailable: (cb: () => void) => void;
      onDownloadProgress: (cb: (p: { percent: number }) => void) => void;
      onUpdateDownloaded: (cb: (version: string) => void) => void;
      onUpdateError: (cb: (message: string) => void) => void;
      onChecking: (cb: () => void) => void;
      onNoUpdate: (cb: () => void) => void;
    };
  }
}

export default function UpdateManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayVersion, setDisplayVersion] = useState(APP_VERSION);
  const [swReady, setSwReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    version: string;
    error?: string;
  } | null>(null);

  // Electron auto-update state
  const [isElectron, setIsElectron] = useState(false);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [readyVersion, setReadyVersion] = useState<string | null>(null);
  const [electronError, setElectronError] = useState<string | null>(null);

  useEffect(() => {
    // Register Service Worker and get stored version
    registerServiceWorker().then((ok) => setSwReady(ok));
    getCurrentVersion().then((v) => setDisplayVersion(v || APP_VERSION));
  }, []);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.isElectron) return;

    setIsElectron(true);
    api
      .getAppVersion()
      .then((v) => {
        if (v) setDisplayVersion(v);
      })
      .catch(() => {});

    api.onChecking(() => {
      setChecking(true);
      setElectronError(null);
    });
    api.onNoUpdate(() => {
      setChecking(false);
      setDownloading(false);
      toast({
        title: "Estás al día",
        description: `Ya tienes la versión más reciente (v${displayVersion}).`,
      });
    });
    api.onUpdateAvailable(() => {
      setChecking(false);
      setDownloading(true);
      setDownloadPercent(0);
      setElectronError(null);
    });
    api.onDownloadProgress((p) => {
      setDownloadPercent(Math.round(p.percent || 0));
    });
    api.onUpdateDownloaded((version) => {
      setDownloading(false);
      setDownloadPercent(100);
      setReadyVersion(version);
      setDisplayVersion(version);
      toast({
        title: "Actualización descargada",
        description: `Versión ${version} lista. Reinicia la aplicación para aplicarla.`,
      });
    });
    api.onUpdateError((message) => {
      setChecking(false);
      setDownloading(false);
      setElectronError(message);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- registrar listeners una sola vez
  }, []);

  const handleManualCheck = async () => {
    const api = window.electronAPI;
    if (!api) return;
    setChecking(true);
    setElectronError(null);
    try {
      await api.checkForUpdates();
      setTimeout(() => setChecking(false), 30000);
    } catch (err: any) {
      setChecking(false);
      setElectronError(err.message || "Error al buscar actualizaciones");
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setLastResult(null);
    setProgress("Leyendo paquete...");
    setProgressPct(10);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgressPct((prev) => {
        if (prev < 85) return prev + Math.random() * 8;
        return prev;
      });
    }, 300);

    try {
      const result = await applyUpdateFromFile(file, (msg) => {
        setProgress(msg);
        if (msg.includes("Almacenando")) setProgressPct(50);
        if (msg.includes("Activando")) setProgressPct(90);
      });

      clearInterval(progressInterval);
      setProgressPct(100);
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Actualización lista",
          description: `Versión ${result.version} aplicada. Recarga la página para ver los cambios.`,
        });
        // Auto-reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        toast({
          title: "No se pudo actualizar",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setLastResult({ success: false, version: "", error: err.message });
      toast({
        title: "Error al procesar actualización",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Actualización de la Aplicación
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              v{displayVersion}
            </Badge>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* How it works */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200/60 dark:border-blue-800/30">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <p className="font-medium mb-1">¿Cómo funciona?</p>
              {isElectron ? (
                <p>
                  La aplicación busca nuevas versiones automáticamente en GitHub al iniciar y
                  cada 4 horas. Cuando haya una actualización, se descarga en segundo plano y
                  solo necesitas reiniciar para aplicarla. Tus datos se conservan intactos.
                </p>
              ) : (
                <p>
                  Cuando haya una mejora disponible, se te entregará un archivo de actualización
                  (.json). Impórtalo aquí y la app se actualizará sin necesidad de descargar
                  ni reemplazar archivos. Tus datos (gastos, pagos, ingresos) se conservan intactos.
                </p>
              )}
            </div>
          </div>
        </div>

        {isElectron ? (
          /* ===== Electron: auto-update ===== */
          <div className="space-y-3">
            {/* Update downloaded and ready */}
            <AnimatePresence>
              {readyVersion && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200/60 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Versión {readyVersion} descargada
                        </p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                          Reinicia para aplicar los cambios
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => window.electronAPI?.installUpdate()}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reiniciar ahora
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Downloading progress */}
            <AnimatePresence>
              {downloading && !readyVersion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Descargando actualización...
                      </span>
                      <span className="font-medium">{downloadPercent}%</span>
                    </div>
                    <Progress value={downloadPercent} className="h-2" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Check button */}
            {!readyVersion && (
              <Button
                variant="outline"
                className="gap-2 w-full justify-center"
                onClick={handleManualCheck}
                disabled={checking || downloading}
              >
                {checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {checking
                  ? "Buscando actualizaciones..."
                  : downloading
                    ? "Descargando..."
                    : "Buscar actualizaciones"}
              </Button>
            )}

            {/* Electron error */}
            <AnimatePresence>
              {electronError && !readyVersion && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200/60 dark:border-red-800/30">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        Error al buscar actualizaciones
                      </p>
                      <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-0.5">
                        {electronError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ===== Web: manual import ===== */
          <>
        {/* Import button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 flex-1 justify-center"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isProcessing ? "Procesando..." : "Importar Actualización"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Progress */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{progress}</span>
                  <span className="font-medium">{Math.round(progressPct)}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {lastResult && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {lastResult.success ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200/60 dark:border-emerald-800/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Actualización v{lastResult.version} aplicada
                    </p>
                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                      Recargando la aplicación...
                    </p>
                  </div>
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-500 ml-auto shrink-0" />
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200/60 dark:border-red-800/30">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      Error en la actualización
                    </p>
                    <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-0.5">
                      {lastResult.error}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}

        {/* Technical details (collapsible) */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Separator className="my-2" />
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Versión instalada</span>
                  <span className="font-mono font-medium text-foreground">
                    {displayVersion}
                  </span>
                </div>
                {isElectron ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Mecanismo</span>
                      <span>GitHub Releases + electron-updater</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Frecuencia</span>
                      <span>Al iniciar y cada 4 horas</span>
                    </div>
                    <p className="text-[10px] mt-2 leading-relaxed">
                      La actualización se descarga en segundo plano desde las Releases del
                      repositorio. Al reiniciar, el instalador aplica los cambios y tus datos
                      en localStorage se conservan intactos.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Service Worker</span>
                      <span className={swReady ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                        {swReady ? "Activo" : "No disponible"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mecanismo</span>
                      <span>Cache API + Service Worker</span>
                    </div>
                    <p className="text-[10px] mt-2 leading-relaxed">
                      El Service Worker intercepta todas las solicitudes de la app y sirve los
                      archivos desde la caché de la versión activa. Al importar una actualización,
                      los nuevos archivos se almacenan en una nueva caché y se activan al recargar.
                      Tus datos en localStorage nunca se modifican durante una actualización.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
