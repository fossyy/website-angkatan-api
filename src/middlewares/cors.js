import cors from "cors";

// TODO: get origin cors dari env
// export const corsConfig = cors({
//   origin: "*", 
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: false,
// });

export const corsConfig = cors();