
import { createClient, RedisClientType } from 'redis';

class RedisManager {
    private queue: RedisClientType;
    private pubSub: RedisClientType;
    private static instance: RedisManager;
    private constructor() {
        this.queue = createClient();
        this.pubSub = createClient();
        this.queue.connect();
        this.pubSub.connect();
    }

    public static getInstance() {
        if (!RedisManager.instance) {
            return this.instance = new RedisManager;
        }
        return this.instance;
    }

    public async pushToQueue(documentId: string, data: any) {
       await this.queue.rPush(documentId, JSON.stringify(data));
    }

    public async getQueue(documentId: string) {
       const data: string[] = await this.queue.lRange(documentId, 0, -1);
       return data.map(item => JSON.parse(item));
    }

    public async removeFromQueue(documentId: string, length: number) {
        console.log('removeFromQueue', documentId, length);
       await this.queue.lTrim(documentId, length, -1);
    }
}

export const redisManager = RedisManager.getInstance();
