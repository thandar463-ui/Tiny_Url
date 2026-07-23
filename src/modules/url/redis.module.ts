import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';

async function create() {
    console.log('hi');

    const client = createClient();
    await client.connect();

    return client;
}

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CONN',
            useFactory: async () => {

                const client = createClient({
                    socket: {
                        host: process.env.REDIS_HOST,
                        port: Number(process.env.REDIS_PORT),
                    },
                });

                await client.connect();
                console.log('Redis connrcted');

                return client;
            },
        },
    ],
    exports: ['REDIS_CONN'],
})

export class RedisModule { }