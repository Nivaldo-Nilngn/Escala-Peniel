// Audio Worklet Processor para análise de áudio em tempo real
// Substitui o ScriptProcessorNode depreciado

class AudioAnalyzerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    // Se não há entrada, retorna
    if (!input || !input[0]) {
      return true;
    }

    const inputChannel = input[0];

    // Copia entrada para saída (pass-through)
    for (let channel = 0; channel < output.length; channel++) {
      output[channel].set(inputChannel);
    }

    // Acumula amostras no buffer
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex] = inputChannel[i];
      this.bufferIndex++;

      // Quando o buffer está cheio, envia para análise
      if (this.bufferIndex >= this.bufferSize) {
        // Envia buffer para o thread principal
        this.port.postMessage({
          buffer: Array.from(this.buffer),
          sampleRate: sampleRate
        });
        
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('audio-analyzer-processor', AudioAnalyzerProcessor);
