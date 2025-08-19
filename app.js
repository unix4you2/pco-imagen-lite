class ImageOptimizer {
    constructor() {
        this.originalFile = null;
        this.compressedBlob = null;
        this.quality = 0.8;
        this.originalImageUrl = null;
        this.compressedImageUrl = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeQualityValue();
    }
    
    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.qualitySection = document.getElementById('qualitySection');
        this.originalInfo = document.getElementById('originalInfo');
        this.originalInfoContent = document.getElementById('originalInfoContent');
        this.compressedInfo = document.getElementById('compressedInfo');
        this.compressedInfoContent = document.getElementById('compressedInfoContent');
        this.statsSection = document.getElementById('statsSection');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.errorAlert = document.getElementById('errorAlert');
        this.processingSpinner = document.getElementById('processingSpinner');
    }
    
    initializeQualityValue() {
        this.qualityValue.textContent = Math.round(this.quality * 100) + '%';
    }
    
    attachEventListeners() {
        // Drag & Drop events
        this.dropZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('drag-over');
        });
        
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('drag-over');
        });
        
        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Only remove drag-over if we're leaving the drop zone entirely
            const rect = this.dropZone.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                this.dropZone.classList.remove('drag-over');
            }
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) this.handleFile(files[0]);
        });
        
        // File input click handler
        this.dropZone.addEventListener('click', (e) => {
            e.preventDefault();
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
        
        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.quality = parseFloat(e.target.value);
            this.qualityValue.textContent = Math.round(this.quality * 100) + '%';
            if (this.originalFile) {
                this.showProcessing();
                // Use setTimeout to allow UI to update before compression
                setTimeout(() => {
                    this.compressImage();
                }, 50);
            }
        });
        
        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        // Prevent default drag behaviors on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }
    
    handleFile(file) {
        console.log('Handling file:', file.name, file.type, file.size);
        
        if (!this.validateFile(file)) return;
        
        this.cleanupUrls();
        this.originalFile = file;
        this.originalImageUrl = URL.createObjectURL(file);
        
        this.showOriginalInfo(file);
        this.showProcessing();
        this.compressImage();
        this.hideError();
        this.qualitySection.classList.remove('hidden');
    }
    
    validateFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            this.showError('Tipo de archivo no válido. Use PNG, JPG, JPEG o WebP.');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showError('El archivo es demasiado grande. Máximo 10MB.');
            return false;
        }
        
        return true;
    }
    
    showOriginalInfo(file) {
        const img = new Image();
        img.onload = () => {
            this.originalInfoContent.innerHTML = `
                <div class="text-center mb-3">
                    <img src="${this.originalImageUrl}" 
                         class="img-fluid rounded" 
                         style="max-width: 300px; max-height: 200px; object-fit: contain;"
                         alt="Imagen original">
                </div>
                <h6 class="card-title text-primary mb-3">📁 Archivo Original</h6>
                <div class="row">
                    <div class="col-sm-6">
                        <p class="mb-1"><strong>Nombre:</strong></p>
                        <p class="small text-muted mb-2">${file.name}</p>
                        <p class="mb-1"><strong>Tamaño:</strong></p>
                        <p class="small text-muted mb-2">${this.formatBytes(file.size)}</p>
                    </div>
                    <div class="col-sm-6">
                        <p class="mb-1"><strong>Dimensiones:</strong></p>
                        <p class="small text-muted mb-2">${img.width} × ${img.height} px</p>
                        <p class="mb-1"><strong>Tipo:</strong></p>
                        <p class="mb-2"><span class="badge bg-info">${this.getFileTypeDisplay(file.type)}</span></p>
                    </div>
                </div>
            `;
            
            this.originalInfo.classList.remove('hidden');
        };
        
        img.onerror = () => {
            this.showError('Error al cargar la imagen. Intente con otro archivo.');
        };
        
        img.src = this.originalImageUrl;
    }
    
    async compressImage() {
        try {
            this.compressedBlob = await this.compressAdvanced(this.originalFile, this.quality);
            
            if (this.compressedImageUrl) {
                URL.revokeObjectURL(this.compressedImageUrl);
            }
            this.compressedImageUrl = URL.createObjectURL(this.compressedBlob);
            
            this.showCompressedInfo();
            this.showStats();
            this.downloadBtn.classList.remove('hidden');
            this.hideProcessing();
        } catch (error) {
            console.error('Error compressing image:', error);
            this.hideProcessing();
            this.showError('Error al comprimir la imagen: ' + error.message);
        }
    }
    
    // NUEVA ESTRATEGIA DE COMPRESIÓN AVANZADA
    async compressAdvanced(file, quality) {
        try {
            if (file.type === 'image/png') {
                // PNG - algoritmo simplificado
                return await this.compressPNGOnly(file, quality);
            } else {
                // JPEG y WebP - mantener algoritmo existente EXACTAMENTE
                return await this.compressIntelligent(file, quality);
            }
        } catch (error) {
            console.warn('Compresión avanzada falló, usando básica:', error);
            return await this.compressBasic(file, quality);
        }
    }
    
    // NUEVO ALGORITMO PNG SIMPLIFICADO
    async compressPNGOnly(file, quality) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                this.compressPNGSimplified(canvas, ctx, img, quality, resolve);
            };
            
            img.onerror = () => reject(new Error('Error cargando PNG'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    // ALGORITMO PNG SIMPLIFICADO
    compressPNGSimplified(canvas, ctx, img, quality, resolve) {
        ctx.drawImage(img, 0, 0);
        
        // Para calidad muy alta, usar PNG original
        if (quality >= 0.95) {
            canvas.toBlob(resolve, 'image/png');
            return;
        }
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Análisis básico rápido
        const hasTransparency = this.hasAlphaChannel(data);
        
        // Estrategia simple basada en calidad
        if (quality < 0.8) {
            if (hasTransparency) {
                // Con transparencia - optimización muy suave
                this.optimizePNGWithAlpha(data, quality);
            } else {
                // Sin transparencia - puede ser más agresivo
                this.optimizePNGOpaque(data, quality);
            }
            
            ctx.putImageData(imageData, 0, 0);
        }
        
        canvas.toBlob(resolve, 'image/png');
    }
    
    hasAlphaChannel(data) {
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) return true;
        }
        return false;
    }
    
    optimizePNGWithAlpha(data, quality) {
        // Para PNG con transparencia - MUY conservador
        const factor = Math.max(4, Math.floor((1 - quality) * 12));
        
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            
            // Solo optimizar píxeles completamente opacos
            if (alpha === 255) {
                // Cuantización muy suave solo en canales RGB
                data[i] = Math.round(data[i] / factor) * factor;
                data[i + 1] = Math.round(data[i + 1] / factor) * factor;
                data[i + 2] = Math.round(data[i + 2] / factor) * factor;
            }
            // NUNCA tocar alpha channel
        }
    }
    
    optimizePNGOpaque(data, quality) {
        // Para PNG sin transparencia - puede ser un poco más agresivo
        const factor = Math.max(3, Math.floor((1 - quality) * 16));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(data[i] / factor) * factor;
            data[i + 1] = Math.round(data[i + 1] / factor) * factor;
            data[i + 2] = Math.round(data[i + 2] / factor) * factor;
            data[i + 3] = 255; // Forzar opacidad total
        }
    }
    
    // MANTENER EXACTAMENTE EL ALGORITMO JPEG EXISTENTE
    async compressIntelligent(file, quality) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                if (file.type === 'image/jpeg') {
                    this.compressJPEGAdvanced(canvas, ctx, img, quality, resolve);
                } else {
                    // WebP y otros
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(resolve, file.type, quality);
                }
            };
            
            img.onerror = () => reject(new Error('Error cargando imagen inteligente'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    // MANTENER EXACTAMENTE TODO EL ALGORITMO JPEG AVANZADO
    compressJPEGAdvanced(canvas, ctx, img, quality, resolve) {
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const analysis = this.analyzeJPEGContent(imageData.data, canvas.width, canvas.height);
        
        // Pre-procesamiento según contenido
        if (analysis.hasHighFrequency && quality < 0.8) {
            this.applySmartSmoothing(imageData.data, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
        }
        
        // Ajustar calidad según contenido de la imagen
        const adaptiveQuality = this.calculateAdaptiveQuality(quality, analysis);
        
        canvas.toBlob(resolve, 'image/jpeg', adaptiveQuality);
    }
    
    analyzeJPEGContent(data, width, height) {
        let totalVariation = 0;
        let uniformAreas = 0;
        let highContrastPixels = 0;
        const sampleSize = Math.min(10000, data.length / 4);
        const step = Math.max(1, Math.floor((data.length / 4) / sampleSize));
        
        for (let i = 0; i < data.length; i += 4 * step) {
            if (i + 4 >= data.length) break;
            
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calcular gradiente local
            const gradient = this.calculateGradient(data, i, width);
            totalVariation += gradient;
            
            if (this.isUniformArea(data, i, width, height)) {
                uniformAreas++;
            }
            
            if (gradient > 30) {
                highContrastPixels++;
            }
        }
        
        const avgVariation = totalVariation / (sampleSize / step);
        const uniformRatio = uniformAreas / (sampleSize / step);
        const contrastRatio = highContrastPixels / (sampleSize / step);
        
        return {
            complexity: avgVariation,
            hasUniformAreas: uniformRatio > 0.3,
            hasHighFrequency: contrastRatio > 0.2,
            uniformRatio: uniformRatio,
            contrastRatio: contrastRatio
        };
    }
    
    calculateGradient(data, index, width) {
        const pixelWidth = width * 4;
        let gradient = 0;
        
        // Gradiente horizontal
        if (index + 4 < data.length && (index + 4) % pixelWidth !== 0) {
            gradient += Math.abs(data[index] - data[index + 4]);
            gradient += Math.abs(data[index + 1] - data[index + 5]);
            gradient += Math.abs(data[index + 2] - data[index + 6]);
        }
        
        // Gradiente vertical
        if (index + pixelWidth < data.length) {
            gradient += Math.abs(data[index] - data[index + pixelWidth]);
            gradient += Math.abs(data[index + 1] - data[index + pixelWidth + 1]);
            gradient += Math.abs(data[index + 2] - data[index + pixelWidth + 2]);
        }
        
        return gradient / 6;
    }
    
    isUniformArea(data, index, width, height) {
        const pixelWidth = width * 4;
        const checkRadius = 2;
        let variations = 0;
        let comparisons = 0;
        
        const centerR = data[index];
        const centerG = data[index + 1];
        const centerB = data[index + 2];
        
        for (let dy = -checkRadius; dy <= checkRadius; dy++) {
            for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const newIndex = index + (dy * pixelWidth) + (dx * 4);
                if (newIndex >= 0 && newIndex < data.length) {
                    const diffR = Math.abs(centerR - data[newIndex]);
                    const diffG = Math.abs(centerG - data[newIndex + 1]);
                    const diffB = Math.abs(centerB - data[newIndex + 2]);
                    const totalDiff = diffR + diffG + diffB;
                    
                    if (totalDiff > 20) variations++;
                    comparisons++;
                }
            }
        }
        
        return comparisons > 0 && (variations / comparisons) < 0.3;
    }
    
    applySmartSmoothing(data, width, height) {
        const pixelWidth = width * 4;
        const smoothed = new Uint8ClampedArray(data);
        
        for (let i = 0; i < data.length; i += 4) {
            if (this.isUniformArea(data, i, width, height)) {
                // Aplicar suavizado en áreas uniformes
                const neighbors = this.getNeighborColors(data, i, width);
                if (neighbors.length > 0) {
                    let avgR = 0, avgG = 0, avgB = 0;
                    neighbors.forEach(color => {
                        avgR += color.r;
                        avgG += color.g;
                        avgB += color.b;
                    });
                    
                    smoothed[i] = Math.round(avgR / neighbors.length);
                    smoothed[i + 1] = Math.round(avgG / neighbors.length);
                    smoothed[i + 2] = Math.round(avgB / neighbors.length);
                }
            }
        }
        
        // Copiar de vuelta al array original
        for (let i = 0; i < data.length; i++) {
            data[i] = smoothed[i];
        }
    }
    
    getNeighborColors(data, index, width) {
        const neighbors = [];
        const pixelWidth = width * 4;
        const offsets = [-4, 4, -pixelWidth, pixelWidth];
        
        offsets.forEach(offset => {
            const newIndex = index + offset;
            if (newIndex >= 0 && newIndex < data.length) {
                neighbors.push({
                    r: data[newIndex],
                    g: data[newIndex + 1],
                    b: data[newIndex + 2]
                });
            }
        });
        
        return neighbors;
    }
    
    calculateAdaptiveQuality(baseQuality, analysis) {
        let adaptiveQuality = baseQuality;
        
        // Si tiene muchas áreas uniformes, puede usar menor calidad
        if (analysis.hasUniformAreas && analysis.uniformRatio > 0.5) {
            adaptiveQuality = Math.max(0.3, baseQuality - 0.1);
        }
        
        // Si tiene mucho detalle, mantener mayor calidad
        if (analysis.hasHighFrequency && analysis.contrastRatio > 0.4) {
            adaptiveQuality = Math.min(0.9, baseQuality + 0.1);
        }
        
        // Para imágenes muy complejas, ser más conservador
        if (analysis.complexity > 50) {
            adaptiveQuality = Math.min(0.9, baseQuality + 0.05);
        }
        
        return Math.max(0.1, Math.min(0.95, adaptiveQuality));
    }
    
    // MÉTODO DE COMPRESIÓN BÁSICA COMO FALLBACK
    async compressBasic(file, quality) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Usar formato original con calidad básica
                    if (file.type === 'image/png') {
                        canvas.toBlob(resolve, 'image/png');
                    } else {
                        canvas.toBlob(resolve, file.type, quality);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Error al procesar la imagen'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    showCompressedInfo() {
        this.compressedInfoContent.innerHTML = `
            <div class="text-center mb-3">
                <img src="${this.compressedImageUrl}" 
                     class="img-fluid rounded" 
                     style="max-width: 300px; max-height: 200px; object-fit: contain;"
                     alt="Imagen comprimida">
            </div>
            <h6 class="card-title text-success mb-3">✨ Archivo Comprimido</h6>
            <div class="row">
                <div class="col-sm-6">
                    <p class="mb-1"><strong>Tamaño:</strong></p>
                    <p class="small text-muted mb-2">${this.formatBytes(this.compressedBlob.size)}</p>
                    <p class="mb-1"><strong>Calidad:</strong></p>
                    <p class="mb-2"><span class="badge bg-warning text-dark">${Math.round(this.quality * 100)}%</span></p>
                </div>
                <div class="col-sm-6">
                    <p class="mb-1"><strong>Formato:</strong></p>
                    <p class="mb-2"><span class="badge bg-success">${this.getFileTypeDisplay(this.originalFile.type)}</span></p>
                    <p class="mb-1"><strong>Estado:</strong></p>
                    <p class="mb-2"><span class="badge bg-primary">Optimizado</span></p>
                </div>
            </div>
        `;
        this.compressedInfo.classList.remove('hidden');
    }
    
    showStats() {
        const originalSize = this.originalFile.size;
        const compressedSize = this.compressedBlob.size;
        const reduction = originalSize - compressedSize;
        const percentage = Math.round((reduction / originalSize) * 100);
        
        let badgeClass = 'bg-secondary';
        let statusText = 'Sin optimización';
        
        if (percentage > 70) {
            badgeClass = 'bg-success';
            statusText = 'Excelente optimización';
        } else if (percentage > 50) {
            badgeClass = 'bg-primary';
            statusText = 'Buena optimización';
        } else if (percentage > 20) {
            badgeClass = 'bg-warning text-dark';
            statusText = 'Optimización moderada';
        } else if (percentage > 0) {
            badgeClass = 'bg-info text-dark';
            statusText = 'Optimización ligera';
        } else {
            badgeClass = 'bg-danger';
            statusText = 'Sin reducción';
        }
        
        this.statsSection.innerHTML = `
            <div class="card stats-card">
                <h6 class="card-title text-primary mb-3">📊 Estadísticas de Optimización</h6>
                <div class="row text-center mb-3">
                    <div class="col-4">
                        <div class="h2">${Math.max(0, percentage)}%</div>
                        <small class="text-muted">Reducción</small>
                    </div>
                    <div class="col-4">
                        <div class="h6">${this.formatBytes(Math.max(0, reduction))}</div>
                        <small class="text-muted">Ahorrado</small>
                    </div>
                    <div class="col-4">
                        <span class="badge ${badgeClass}">${statusText}</span>
                    </div>
                </div>
                <div class="progress mb-3">
                    <div class="progress-bar ${badgeClass.replace('text-dark', '')}" 
                         style="width: ${Math.max(0, percentage)}%"
                         role="progressbar"></div>
                </div>
                <div class="row small text-center">
                    <div class="col-6">
                        <div class="text-info">Original</div>
                        <div>${this.formatBytes(originalSize)}</div>
                    </div>
                    <div class="col-6">
                        <div class="text-success">Comprimido</div>
                        <div>${this.formatBytes(compressedSize)}</div>
                    </div>
                </div>
            </div>
        `;
        
        this.statsSection.classList.remove('hidden');
    }
    
    getFileTypeDisplay(mimeType) {
        switch (mimeType) {
            case 'image/png': return 'PNG';
            case 'image/jpeg': return 'JPEG';
            case 'image/jpg': return 'JPG';
            case 'image/webp': return 'WebP';
            default: return mimeType.split('/')[1].toUpperCase();
        }
    }
    
    getFileExtension(mimeType) {
        switch (mimeType) {
            case 'image/png': return '.png';
            case 'image/jpeg': case 'image/jpg': return '.jpg';
            case 'image/webp': return '.webp';
            default: return '.jpg';
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    downloadImage() {
        if (!this.compressedBlob) return;
        
        const url = URL.createObjectURL(this.compressedBlob);
        const a = document.createElement('a');
        const originalName = this.originalFile.name.split('.')[0];
        const extension = this.getFileExtension(this.originalFile.type);
        const filename = `optimizado_${originalName}${extension}`;
        
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    }
    
    showProcessing() {
        if (this.processingSpinner) {
            this.processingSpinner.classList.remove('hidden');
        }
    }
    
    hideProcessing() {
        if (this.processingSpinner) {
            this.processingSpinner.classList.add('hidden');
        }
    }
    
    showError(message) {
        this.errorAlert.innerHTML = `
            <div class="alert alert-danger alert-dismissible">
                <strong>❌ Error:</strong> ${message}
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.classList.add('hidden')">
                    ×
                </button>
            </div>
        `;
        this.errorAlert.classList.remove('hidden');
    }
    
    hideError() {
        this.errorAlert.classList.add('hidden');
    }
    
    cleanupUrls() {
        if (this.originalImageUrl) {
            URL.revokeObjectURL(this.originalImageUrl);
            this.originalImageUrl = null;
        }
        if (this.compressedImageUrl) {
            URL.revokeObjectURL(this.compressedImageUrl);
            this.compressedImageUrl = null;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageOptimizer();
});