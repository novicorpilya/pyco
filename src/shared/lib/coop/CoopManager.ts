export interface TeamVoteResult {
  status: 'SUCCESS' | 'SPLIT_VOTE' | 'DOUBLE_FAIL';
  xpBonusPercentage: number;
  penaltyXp: number;
  hpDamage: number;
  message: string;
}

export class CoopManager {
  public static generateRoomCode(): string {
    const randomDigits = Math.floor(100 + Math.random() * 900);
    return `PYCO-${randomDigits}`;
  }

  public static evaluateTeamVote(player1Correct: boolean, player2Correct: boolean): TeamVoteResult {
    // 1. Both Correct -> SUCCESS (+100% XP bonus)
    if (player1Correct && player2Correct) {
      return {
        status: 'SUCCESS',
        xpBonusPercentage: 100,
        penaltyXp: 0,
        hpDamage: 0,
        message: '🎉 Идеальное единство! Оба игрока ответили правильно! Бонус +100% XP!'
      };
    }

    // 2. One Correct, One Incorrect -> SPLIT_VOTE (Re-evaluate)
    if (player1Correct || player2Correct) {
      return {
        status: 'SPLIT_VOTE',
        xpBonusPercentage: 0,
        penaltyXp: 0,
        hpDamage: 0,
        message: '⚠️ Мнения разделились! Один ответил верно, другой ошибся. Обсудите ответ и попробуйте еще раз!'
      };
    }

    // 3. Both Incorrect -> DOUBLE_FAIL (Double penalty & HP damage)
    return {
      status: 'DOUBLE_FAIL',
      xpBonusPercentage: 0,
      penaltyXp: -40,
      hpDamage: 15,
      message: '💥 Командный провал! Оба игрока ответили неверно. Удвоенный штраф -40 XP и урон -15 HP!'
    };
  }
}
