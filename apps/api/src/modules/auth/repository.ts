export interface AuthRepository {
  saveState(userId: string, state: string): Promise<void>;
  validateState(userId: string, state: string): Promise<boolean>;
}

export class InMemoryAuthRepository implements AuthRepository {
  private readonly states = new Map<string, string>();

  async saveState(userId: string, state: string): Promise<void> {
    this.states.set(userId, state);
  }

  async validateState(userId: string, state: string): Promise<boolean> {
    return this.states.get(userId) === state;
  }
}
