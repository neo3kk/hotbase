'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { addCar } from '../actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import Image from 'next/image';

import { X } from 'lucide-react';

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Guardando...' : 'Añadir a la Colección'}</Button>;
}

export function AddCarForm() {
  const [state, formAction] = useFormState(addCar, initialState);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (state?.message && state.error) {
      toast.error(state.message);
    }
  }, [state]);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error: unknown) {
        console.error("Error accessing camera: ", error);
        let errorMessage = "No se pudo acceder a la cámara.";
        if (error instanceof Error) {
          switch (error.name) {
            case 'NotAllowedError':
              errorMessage = "Permiso denegado. Por favor, permite el acceso a la cámara en los ajustes de tu navegador.";
              break;
            case 'NotFoundError':
              errorMessage = "No se encontró una cámara compatible en tu dispositivo.";
              break;
            case 'NotReadableError':
              errorMessage = "La cámara está siendo utilizada por otra aplicación.";
              break;
            case 'OverconstrainedError':
              errorMessage = "No se pudo encontrar una cámara trasera. Intentando con la frontal.";
              // Fallback to any camera
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  return; // Exit after successful fallback
                }
              } catch (_fallbackError) {
                errorMessage = "No se pudo encontrar ninguna cámara disponible.";
              }
              break;
            default:
              errorMessage = `Error desconocido: ${error.message}`;
              break;
          }
        }
        toast.error(errorMessage);
        setIsCameraModalOpen(false);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraModalOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/webp');
      setCapturedImage(dataUrl);
      setIsCameraModalOpen(false); // Close the modal
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleFormAction = async (formData: FormData) => {
    if (capturedImage) {
      const imageFile = dataURLtoFile(capturedImage, `capture-${Date.now()}.webp`);
      if (imageFile) {
        formData.set('images', imageFile);
      }
    }
    await formAction(formData);
  };

  return (
    <form action={handleFormAction}>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="name">Nombre del Coche</Label><Input id="name" name="name" placeholder="'87 Dodge D100" required /></div>
            <div className="grid gap-2"><Label htmlFor="collection_number">Número de Colección</Label><Input id="collection_number" name="collection_number" placeholder="R0916" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="model_year">Año del Modelo</Label><Input id="model_year" name="model_year" type="number" placeholder="1987" /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="series">Serie</Label><Input id="series" name="series" placeholder="HW Trucks" /></div>
            <div className="grid gap-2"><Label htmlFor="color">Color</Label><Input id="color" name="color" placeholder="Rojo" /></div>
          </div>
          {/* Columna Derecha */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="condition">Condición</Label>
              <Select name="condition" defaultValue="en-blister">
                <SelectTrigger><SelectValue placeholder="Selecciona una condición" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-blister">En blíster</SelectItem>
                  <SelectItem value="suelto">Suelto</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label htmlFor="purchase_price">Precio de Compra (€)</Label><Input id="purchase_price" name="purchase_price" type="number" step="0.01" placeholder="2.99" /></div>
            <div className="grid gap-2"><Label htmlFor="notes">Notas</Label><Textarea id="notes" name="notes" placeholder="Comprado en El Corte Inglés..." /></div>
            <div className="grid gap-2">
              <Label htmlFor="images">Imágenes</Label>
              <div className="flex gap-2">
                <AlertDialog open={isCameraModalOpen} onOpenChange={setIsCameraModalOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline">Hacer Foto</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Capturar Imagen</AlertDialogTitle></AlertDialogHeader>
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-md"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <Button onClick={handleCapture}>Capturar</Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {capturedImage && (
                <div className="mt-4">
                  <Label>Vista Previa:</Label>
                  <div className="relative w-fit mt-2">
                    <Image src={capturedImage} alt="Captured image preview" width={150} height={150} className="rounded-md border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setCapturedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6"><SubmitButton /></div>
    </form>
  );
}