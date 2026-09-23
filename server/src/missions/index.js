import gymCancellation from "./gym-cancellation.js";
import flightRefund from "./flight-refund.js";
import jobInterview from "./job-interview.js";
import marketHaggle from "./market-haggle.js";
import hotelBooking from "./hotel-booking.js";

// Ordem em que as missões aparecem na tela inicial.
// Para adicionar uma sexta missão: crie um novo arquivo neste diretório
// (copiando um dos existentes como modelo) e adicione o import + entrada aqui.
export const missions = [
  gymCancellation,
  flightRefund,
  jobInterview,
  marketHaggle,
  hotelBooking,
];

export const missionsById = Object.fromEntries(missions.map((m) => [m.id, m]));
