const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // create 10 fake users
    const users = [];
    for (let i = 0; i < 10; i++) {
        const username = faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '') + i;
        const user = await prisma.user.create({
            data: {
                githubId: faker.string.uuid(),
                username,
                displayName: faker.person.fullName(),
                avatarUrl: faker.image.avatarGitHub(),
                bio: faker.lorem.sentence(),
            }
        });
        users.push(user);
        console.group(`Created user: ${user.username}`);
    }

    //each user creates 3-6 posts
    for (const user of users) {
        const postCount = faker.number.int({ min: 3, max: 6 });
        for (let i = 0; i < postCount; i++) {
            await prisma.post.create({
                data: {
                    content:  faker.lorem.sentence({min: 3, max: 6}),
                    authorId: user.id,
                    createdAt: faker.date.recent({ days: 30 })
                }
            });
        }
        console.log(`Created ${postCount} posts for user: ${user.username}`);
    }

    // creaate some follow relationships
    for (const user of users) {
        // following 3 random others
        const shuffled = users.filter(u => u.id !== user.id).sort(() => 0.5 - Math.random());
        const toFollow = shuffled.slice(0, 3);

        for (const target of toFollow) {
            await prisma.follow.create({
                data: {
                    followerId: user.id,
                    followingId: target.id,
                    status: 'ACCEPTED'
                }
            });
        }
    }
    console.log("created follow relationships");

    // add some likes
    const allPosts = await prisma.post.findMany();
    for (const user of users) {
        const shuffledPosts = allPosts.filter(p => p.authorId !== user.id).sort(() => 0.5 - Math.random());
        const toLike = shuffledPosts.slice(0, 5);

        for (const post of toLike) {
            await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: post.id
                }
            });
        }
    }
    console.log("created likes");

    // add some comments
    for (const user of users) {
        const shuffledPosts = allPosts.filter(p => p.authorId !== user.id).sort(() => 0.5 - Math.random());
        const toComment = shuffledPosts.slice(0, 5);
        
        for (const post of toComment) {
            await prisma.comment.create({
                data: {
                    content: faker.lorem.sentence({min: 3, max: 15}),
                    authorId: user.id,
                    postId: post.id
                }
            });
        }
    }
    console.log("created comments");

    console.log('Database seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });