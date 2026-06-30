import { Router } from "express";
import { getDatabase } from "../../lib/db";

export const adminRouter = Router();

adminRouter.get("/sessions", (_request, response) => {
  const sessions = getDatabase()
    .prepare(`
      select
        game_sessions.session_token as sessionToken,
        orders.order_number as orderNumber,
        battle_results.result as result,
        battle_results.score as score
      from game_sessions
      join orders on orders.id = game_sessions.order_id
      join battle_results on battle_results.session_id = game_sessions.id
      order by game_sessions.id desc
    `)
    .all();

  response.json({ sessions });
});
