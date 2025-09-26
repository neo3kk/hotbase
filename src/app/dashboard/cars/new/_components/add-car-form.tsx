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

interface PuterUser {
  username: string;
  // Add other user properties if needed
}

interface PuterAuth {
  isSignedIn(): Promise<boolean>;
  signIn(): Promise<PuterUser>;
}

interface PuterAI {
  img2txt(image: string): Promise<OcrResponse | string>;
}

interface OcrResponse {
  success: boolean;
  service: {
    name: string;
  };
  result: {
    blocks: OcrBlock[];
  };
  metadata: any;
}

interface OcrBlock {
  type: string;
  confidence: number;
  text: string;
}

interface Puter {
  auth: PuterAuth;
  ai: PuterAI;
}

declare const puter: Puter;

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
 const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [collectionOrSeriesName, setCollectionOrSeriesName] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [seriesNumber, setSeriesNumber] = useState('');
  const [yearlyCollectionNumber, setYearlyCollectionNumber] = useState('');
  const [color, setColor] = useState('');
  const [isPuterAuthenticated, setIsPuterAuthenticated] = useState(false);
  const puterLoginBtnRef = useRef<HTMLButtonElement>(null);
  const [allCars, setAllCars] = useState<any[]>([]);
  const [allCollections, setAllCollections] = useState<string[]>([]);
  const [isCarDataLoading, setIsCarDataLoading] = useState(true);
  const [isOcrRunning, setIsOcrRunning] = useState(false);

  useEffect(() => {
    setIsCarDataLoading(true);
    Promise.all([
      fetch('/all_cars.json').then(res => {
        if (!res.ok) throw new Error('Network response was not ok for all_cars.json');
        return res.json();
      }),
      fetch('/colecciones.json').then(res => {
        if (!res.ok) throw new Error('Network response was not ok for colecciones.json');
        return res.json();
      })
    ])
    .then(([carsData, collectionsData]) => {
      setAllCars(carsData);
      setAllCollections(collectionsData);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      toast.error("No se pudieron cargar los datos necesarios para el formulario.");
    })
    .finally(() => {
      setIsCarDataLoading(false);
    });
  }, []);

  const normalizeText = (text: string): string => {
    if (typeof text !== 'string') {
        return ''; // Return an empty string if text is not a string
    }
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s\/-]/g, '') // Allow '/' and '-' characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const levenshtein = (a: string, b: string): number => {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i += 1) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= b.length; j += 1) {
      matrix[j][0] = j;
    }
    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    return matrix[b.length][a.length];
  };

  const parseOcrText = (textLines: string[]) => {
    let seriesNumberRegex = /(\d+)\/(\d+)/g;
    const yearlyCollectionNumberRegex = /^[1-9]\d{0,2}\/\d{3}$/;
    const modelYearRegex = /\b(19|20)\d{2}\b/;

    let seriesNumber: string | null = null;
    let yearlyCollectionNumber: string | null = null;
    let modelYear: string | null = null;
    let collectionOrSeriesName: string | null = null; // This will be populated from bestMatch
    const potentialNames: string[] = [];

    const normalizedTextLines = textLines.map(line => normalizeText(line));

    for (const line of normalizedTextLines) {
      let match;
      let hasMatch = false;

      // Try to match yearly collection number first (more specific regex)
      const yearlyMatch = line.match(yearlyCollectionNumberRegex);
      if (yearlyMatch) {
        yearlyCollectionNumber = yearlyMatch[0];
        hasMatch = true;
      }

      // Then try to match general series number if not already matched by yearly
      if (!hasMatch) {
        seriesNumberRegex.lastIndex = 0; // Reset regex lastIndex for global regexes
        while ((match = seriesNumberRegex.exec(line)) !== null) {
          hasMatch = true;
          // Only assign to seriesNumber if it's not already a yearlyCollectionNumber
          if (!yearlyCollectionNumber || match[0] !== yearlyCollectionNumber) {
            seriesNumber = match[0];
          }
        }
      }
      if (hasMatch) continue;

      const modelYearMatch = line.match(modelYearRegex);
      if (modelYearMatch) {
        modelYear = modelYearMatch[0];
        continue;
      }

      // Heuristic for collection/series name: if it's mostly letters and spaces, and not a number
      if (line.length > 3 && line.match(/^[a-z\s\-]+$/) && !line.match(/\d/)) {
        collectionOrSeriesName = line;
      }
      potentialNames.push(line);
    }

    // Now, find the best match from the potential names
    console.log("allCars length:", allCars.length);
    if (!allCars.length) return { bestMatch: null, seriesNumber, yearlyCollectionNumber, modelYear, collectionOrSeriesName: null };

    let bestMatch = null;
    let maxScore = 0;

    for (const car of allCars) {
        if (!car.model || !Array.isArray(car.model) || car.model.length === 0) continue;
        let score = 0;
        const carNameLower = normalizeText(car.model[0]);
        const carCollectionOrSeriesNameLower = normalizeText((car.series && Array.isArray(car.series) && car.series[0]) || '');

      let foundName = false;
      let foundSeries = false;

      for (const line of normalizedTextLines) {
        if (carNameLower && line === carNameLower) {
          foundName = true;
          score += 100; // Very high score for exact name match
        }
        if (carCollectionOrSeriesNameLower && line === carCollectionOrSeriesNameLower) {
          foundSeries = true;
          score += 80; // High score for exact collection/series name match
        }
      }

      if (foundName && foundSeries) {
        score += 50; // Bonus for finding both name and series exactly
      }

      if (score >= 80) { // If exact match found for name or collection/series, this is likely the best match
        if (score > maxScore) {
          maxScore = score;
          bestMatch = car;
        }
        continue; // Move to next car
      }

      for (const line of normalizedTextLines) {
        // Name matching (fuzzy)
        const distanceName = levenshtein(line, carNameLower);
        const similarityName = 1 - (distanceName / Math.max(line.length, carNameLower.length));
        if (similarityName > 0.7) { // 70% similarity for name
          score += similarityName * 30;
        }

        if (carCollectionOrSeriesNameLower) {
          const distanceCollectionOrSeries = levenshtein(line, carCollectionOrSeriesNameLower);
          const similarityCollectionOrSeries = 1 - (distanceCollectionOrSeries / Math.max(line.length, carCollectionOrSeriesNameLower.length));
          if (similarityCollectionOrSeries > 0.7) {
            score += similarityCollectionOrSeries * 20;
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = car;
      }
    }

    const MIN_MATCH_SCORE = 30; // Threshold for considering a match valid
    console.log(`Final best match: ${bestMatch?.model?.[0] || 'None'} with max score: ${maxScore}`);
    if (maxScore < MIN_MATCH_SCORE) {
      bestMatch = null;
    }

    return { bestMatch, seriesNumber, yearlyCollectionNumber, modelYear, collectionOrSeriesName: (bestMatch?.series && bestMatch.series[0]) || null };
  };

  const resizeImage = (dataUrl: string, maxWidth = 600): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Reduced quality to 70%
      };
      img.src = dataUrl;
    });
  };

  useEffect(() => {
    if (state?.message && state.error) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    const checkPuterAuth = async () => {
      if (typeof puter !== 'undefined') {
        const signedIn = await puter.auth.isSignedIn();
        if (signedIn) {
          setIsPuterAuthenticated(true);
        }
      }
    };
    checkPuterAuth();
  }, []);

  useEffect(() => {
    const loginBtn = puterLoginBtnRef.current;
    const handlePuterLogin = () => {
      if (typeof puter !== 'undefined') {
        puter.auth.signIn()
          .then((user) => {
            if (user) {
              setIsPuterAuthenticated(true);
              toast.success("¡Autenticado con Puter!");
            }
          })
          .catch((error) => {
            console.error("Puter login error:", error);
            toast.error("Error al iniciar sesión con Puter.");
          });
      }
    };

    if (loginBtn) {
      loginBtn.addEventListener('click', handlePuterLogin);
    }

    return () => {
      if (loginBtn) {
        loginBtn.removeEventListener('click', handlePuterLogin);
      }
    };
  }, [puterLoginBtnRef]);



  const handleOcr = async () => {
    if (!isPuterAuthenticated) {
      toast.error("Por favor, inicia sesión con Puter para usar la IA.");
      return;
    }

    if (!capturedImage) {
      toast.error("Por favor, primero captura o sube una imagen.");
      return;
    }

    setIsOcrRunning(true);
    toast.info("Leyendo datos de la imagen con IA...");

    try {
      const response = await puter.ai.img2txt(capturedImage);
      console.log("OCR Response:", response);

      let lines: string[] = [];
      if (typeof response === 'string') {
        lines = response.split('\n');
      } else if (response.success) {
        lines = response.result.blocks
          .filter(block => block.type === 'text/textract:LINE')
          .map(block => block.text);
      }

      console.log("OCR Lines:", lines);
      const { bestMatch, seriesNumber, yearlyCollectionNumber, modelYear: parsedModelYear } = parseOcrText(lines);
      console.log("Parsed OCR data:", { bestMatch, seriesNumber, yearlyCollectionNumber, parsedModelYear });

      // Clear fields before setting new values
      setName('');
      setCollectionOrSeriesName('');
      setColor('');

      // Always set the parsed values
      setModelYear(parsedModelYear || '');
      setSeriesNumber(seriesNumber || '');
      setYearlyCollectionNumber(yearlyCollectionNumber || '');

      if (bestMatch) {
        // If a good match is found, populate all its data
        setName((bestMatch.model && bestMatch.model[0]) || '');
        setCollectionOrSeriesName((bestMatch.series && bestMatch.series[0]) || '');
        setModelYear(parsedModelYear || bestMatch.model_year || ''); // OCR year takes precedence
        setColor(bestMatch.color || '');
        toast.success("¡Formulario autocompletado con el coche encontrado!");
      } else if (seriesNumber || yearlyCollectionNumber || parsedModelYear) {
        // If no car match, but some data was found
        toast.info("Se encontraron algunos datos, pero no se pudo identificar el coche. Revisa los campos.");
      } else {
        // If nothing was found
        toast.warning("No se pudo extraer ningún dato relevante de la imagen.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Error al leer los datos de la imagen.");
    } finally {
      setIsOcrRunning(false);
    }
  };

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
      resizeImage(dataUrl).then(resizedDataUrl => {
        setCapturedImage(resizedDataUrl);
      });
      setIsCameraModalOpen(false); // Close the modal
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resizeImage(dataUrl).then(resizedDataUrl => {
          setCapturedImage(resizedDataUrl);
        });
      };
      reader.readAsDataURL(file);
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
            <div className="grid gap-2"><Label htmlFor="name">Nombre del Coche</Label><Input id="name" name="name" placeholder="'87 Dodge D100" required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid gap-2">
              <Label htmlFor="collection_or_series_name">Nombre de la Colección/Serie</Label>
              <Input id="collection_or_series_name" name="collection_or_series_name" placeholder="Hot Wheels Mainline" value={collectionOrSeriesName} onChange={(e) => setCollectionOrSeriesName(e.target.value)} list="collections-list" />
              <datalist id="collections-list">
                {allCollections.map((collection) => (
                  <option key={collection} value={collection} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="model_year">Año del Modelo</Label><Input id="model_year" name="model_year" type="number" placeholder="1987" value={modelYear} onChange={(e) => setModelYear(e.target.value)} /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="series_number">Número de Serie</Label><Input id="series_number" name="series_number" placeholder="3/10" value={seriesNumber} onChange={(e) => setSeriesNumber(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="yearly_collection_number">Número de Colección Anual</Label><Input id="yearly_collection_number" name="yearly_collection_number" placeholder="155/256" value={yearlyCollectionNumber} onChange={(e) => setYearlyCollectionNumber(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="color">Color</Label><Input id="color" name="color" placeholder="Rojo" value={color} onChange={(e) => setColor(e.target.value)} /></div>
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
                <Label htmlFor="file-upload" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer">
                  Subir Foto
                </Label>
                <Input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
                  {!isPuterAuthenticated ? (
                    <Button ref={puterLoginBtnRef} type="button" className="mt-2">Login con Puter para usar IA</Button>
                  ) : (
                    <Button type="button" onClick={handleOcr} className="mt-2" disabled={isCarDataLoading || isOcrRunning}>
                      {isCarDataLoading ? 'Cargando base de datos...' : isOcrRunning ? 'Procesando imagen...' : 'Auto-rellenar con IA'}
                    </Button>
                  )}
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
