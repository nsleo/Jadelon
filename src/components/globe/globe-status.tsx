type GlobeStatusProps = {
  modeLabel: string;
  qualityLabel: string;
  warning?: string;
  instructionsSeen: boolean;
};

export function GlobeStatus({
  modeLabel,
  qualityLabel,
  warning,
  instructionsSeen,
}: GlobeStatusProps) {
  return (
    <section aria-label="Estado do globo" className="globe-status">
      <div>
        <span className="globe-status__label">Modo</span>
        <p>{modeLabel}</p>
      </div>
      <div>
        <span className="globe-status__label">Qualidade</span>
        <p>{qualityLabel}</p>
      </div>
      <div>
        <span className="globe-status__label">Interacao</span>
        <p>
          {instructionsSeen
            ? "Arraste para girar, use rolagem ou pinca para aproximar e toque nos pontos para abrir um continente."
            : "O globo inicia com rotação lenta e pode ser explorado por mouse, toque e teclado."}
        </p>
      </div>
      <div>
        <span className="globe-status__label">Limite atual</span>
        <p>
          {warning ??
            "A face posterior e os polos continuam provisórios porque o mapa de origem ainda nao foi convertido para uma textura equiretangular final."}
        </p>
      </div>
    </section>
  );
}
