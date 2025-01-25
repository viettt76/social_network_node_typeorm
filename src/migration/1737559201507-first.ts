import { MigrationInterface, QueryRunner } from "typeorm";

export class First1737559201507 implements MigrationInterface {
    name = 'First1737559201507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`emotion_messages\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`messageId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`emotionType\` enum ('LIKE', 'LOVE', 'LOVE_LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY') NOT NULL, UNIQUE INDEX \`IDX_59dd2eb9657917760f47da230d\` (\`messageId\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`messages\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`senderId\` varchar(255) NOT NULL, \`conversationId\` varchar(255) NOT NULL, \`content\` text NULL, \`messageType\` enum ('TEXT', 'IMAGE', 'FILE', 'VIDEO') NOT NULL DEFAULT 'TEXT', \`isRead\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_e5663ce0c730b2de83445e2fd1\` (\`conversationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversation_histories\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`userId\` varchar(255) NOT NULL, \`conversationId\` varchar(255) NOT NULL, \`lastMessageId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_cb22608d877217ad62617a1de8\` (\`userId\`, \`conversationId\`, \`lastMessageId\`), UNIQUE INDEX \`REL_c654135d06f3521e55c782000e\` (\`conversationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversations\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`type\` enum ('PRIVATE', 'GROUP') NOT NULL, \`name\` varchar(255) NULL, \`avatar\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversation_participants\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`userId\` varchar(255) NOT NULL, \`conversationId\` varchar(255) NOT NULL, \`nickname\` varchar(255) NULL, \`role\` enum ('MEMBER', 'ADMIN') NOT NULL DEFAULT 'MEMBER', UNIQUE INDEX \`IDX_e43efbfa3b850160b5b2c50e3e\` (\`userId\`, \`conversationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`emotion_comments\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`commentId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`emotionType\` enum ('LIKE', 'LOVE', 'LOVE_LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY') NOT NULL, UNIQUE INDEX \`IDX_e7c83b739286342c5866805c29\` (\`commentId\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`emotion_posts\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`postId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`emotionType\` enum ('LIKE', 'LOVE', 'LOVE_LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY') NOT NULL, \`post\` varchar(36) NULL, UNIQUE INDEX \`IDX_b36e8dbc8abd2c5aa91cf6230f\` (\`postId\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`picture_of_posts\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`postId\` varchar(255) NOT NULL, \`pictureUrl\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`posterId\` varchar(255) NOT NULL, \`visibilityType\` enum ('FRIEND', 'PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'FRIEND', \`content\` text NULL, \`isApproved\` tinyint NOT NULL DEFAULT 0, \`isInvalid\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`postId\` varchar(255) NOT NULL, \`commentatorId\` varchar(255) NOT NULL, \`parentCommentId\` varchar(255) NULL, \`content\` text NULL, \`picture\` varchar(255) NULL, INDEX \`IDX_a4367f08021b501ba78f98ae01\` (\`postId\`, \`createdAt\`), INDEX \`IDX_e44ddaaa6d058cb4092f83ad61\` (\`postId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`friend_requests\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`senderId\` varchar(255) NOT NULL, \`receiverId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_5b1eb1e774384cd6d8c7597418\` (\`senderId\`, \`receiverId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`userId\` varchar(255) NOT NULL, \`type\` enum ('LIKE', 'COMMENT', 'CONVERSATIOIN', 'FRIEND_REQUEST') NOT NULL, \`referenceId\` varchar(255) NOT NULL, \`referenceType\` enum ('POST', 'USER', 'CONVERSATIOIN', 'COMMENT') NOT NULL, \`content\` varchar(255) NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`isOpenMenu\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`relationships\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`user1Id\` varchar(255) NOT NULL, \`user2Id\` varchar(255) NOT NULL, \`relationshipType\` enum ('FRIEND', 'LOVE', 'SIBLING', 'BEST_FRIEND') NOT NULL DEFAULT 'FRIEND', UNIQUE INDEX \`IDX_d30e835f69f932c80752f03181\` (\`user1Id\`, \`user2Id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`birthday\` datetime NULL, \`gender\` enum ('MALE', 'FEMALE', 'OTHER') NOT NULL, \`homeTown\` varchar(255) NULL, \`school\` varchar(255) NULL, \`workplace\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`isPrivate\` tinyint NOT NULL DEFAULT 0, \`role\` enum ('USER', 'ADMIN') NOT NULL DEFAULT 'USER', UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`emotion_messages\` ADD CONSTRAINT \`FK_dcd0f45cf416359a543807bb78a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`emotion_messages\` ADD CONSTRAINT \`FK_4857bc5b99d1b82df21966fa3ba\` FOREIGN KEY (\`messageId\`) REFERENCES \`messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_2db9cf2b3ca111742793f6c37ce\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_histories\` ADD CONSTRAINT \`FK_c654135d06f3521e55c782000e0\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_histories\` ADD CONSTRAINT \`FK_a41aed76da0cefe3eb057f536cc\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_histories\` ADD CONSTRAINT \`FK_0777a8a8def5c3848179fce58df\` FOREIGN KEY (\`lastMessageId\`) REFERENCES \`messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_4453e20858b14ab765a09ad728c\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_18c4ba3b127461649e5f5039dbf\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`emotion_comments\` ADD CONSTRAINT \`FK_60b4e27c51d4fd21e54a1b2b977\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`emotion_comments\` ADD CONSTRAINT \`FK_1703a3e8f999b5b130410db712a\` FOREIGN KEY (\`commentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`emotion_posts\` ADD CONSTRAINT \`FK_a909491cdf67ebe5415aa0fe9b2\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`emotion_posts\` ADD CONSTRAINT \`FK_a89916831c7254e6c423b5d4d0b\` FOREIGN KEY (\`post\`) REFERENCES \`posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`picture_of_posts\` ADD CONSTRAINT \`FK_2b852cb97e021d97d0e5a1c29a2\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_94857df7bee361f7fa428a1e2e8\` FOREIGN KEY (\`posterId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_d2741f907ecdcad9589b183c4a7\` FOREIGN KEY (\`commentatorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4875672591221a61ace66f2d4f9\` FOREIGN KEY (\`parentCommentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_e44ddaaa6d058cb4092f83ad61f\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend_requests\` ADD CONSTRAINT \`FK_da724334b35796722ad87d31884\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend_requests\` ADD CONSTRAINT \`FK_97c256506348f9347b3a8a35629\` FOREIGN KEY (\`receiverId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`relationships\` ADD CONSTRAINT \`FK_1cc0c9ef0564d627d77529ae3ea\` FOREIGN KEY (\`user1Id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`relationships\` ADD CONSTRAINT \`FK_5229e6043a9cdbdd727d9f92092\` FOREIGN KEY (\`user2Id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`relationships\` DROP FOREIGN KEY \`FK_5229e6043a9cdbdd727d9f92092\``);
        await queryRunner.query(`ALTER TABLE \`relationships\` DROP FOREIGN KEY \`FK_1cc0c9ef0564d627d77529ae3ea\``);
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\``);
        await queryRunner.query(`ALTER TABLE \`friend_requests\` DROP FOREIGN KEY \`FK_97c256506348f9347b3a8a35629\``);
        await queryRunner.query(`ALTER TABLE \`friend_requests\` DROP FOREIGN KEY \`FK_da724334b35796722ad87d31884\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_e44ddaaa6d058cb4092f83ad61f\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4875672591221a61ace66f2d4f9\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_d2741f907ecdcad9589b183c4a7\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_94857df7bee361f7fa428a1e2e8\``);
        await queryRunner.query(`ALTER TABLE \`picture_of_posts\` DROP FOREIGN KEY \`FK_2b852cb97e021d97d0e5a1c29a2\``);
        await queryRunner.query(`ALTER TABLE \`emotion_posts\` DROP FOREIGN KEY \`FK_a89916831c7254e6c423b5d4d0b\``);
        await queryRunner.query(`ALTER TABLE \`emotion_posts\` DROP FOREIGN KEY \`FK_a909491cdf67ebe5415aa0fe9b2\``);
        await queryRunner.query(`ALTER TABLE \`emotion_comments\` DROP FOREIGN KEY \`FK_1703a3e8f999b5b130410db712a\``);
        await queryRunner.query(`ALTER TABLE \`emotion_comments\` DROP FOREIGN KEY \`FK_60b4e27c51d4fd21e54a1b2b977\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_18c4ba3b127461649e5f5039dbf\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_4453e20858b14ab765a09ad728c\``);
        await queryRunner.query(`ALTER TABLE \`conversation_histories\` DROP FOREIGN KEY \`FK_0777a8a8def5c3848179fce58df\``);
        await queryRunner.query(`ALTER TABLE \`conversation_histories\` DROP FOREIGN KEY \`FK_a41aed76da0cefe3eb057f536cc\``);
        await queryRunner.query(`ALTER TABLE \`conversation_histories\` DROP FOREIGN KEY \`FK_c654135d06f3521e55c782000e0\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_2db9cf2b3ca111742793f6c37ce\``);
        await queryRunner.query(`ALTER TABLE \`emotion_messages\` DROP FOREIGN KEY \`FK_4857bc5b99d1b82df21966fa3ba\``);
        await queryRunner.query(`ALTER TABLE \`emotion_messages\` DROP FOREIGN KEY \`FK_dcd0f45cf416359a543807bb78a\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_d30e835f69f932c80752f03181\` ON \`relationships\``);
        await queryRunner.query(`DROP TABLE \`relationships\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b1eb1e774384cd6d8c7597418\` ON \`friend_requests\``);
        await queryRunner.query(`DROP TABLE \`friend_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_e44ddaaa6d058cb4092f83ad61\` ON \`comments\``);
        await queryRunner.query(`DROP INDEX \`IDX_a4367f08021b501ba78f98ae01\` ON \`comments\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
        await queryRunner.query(`DROP TABLE \`picture_of_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_b36e8dbc8abd2c5aa91cf6230f\` ON \`emotion_posts\``);
        await queryRunner.query(`DROP TABLE \`emotion_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_e7c83b739286342c5866805c29\` ON \`emotion_comments\``);
        await queryRunner.query(`DROP TABLE \`emotion_comments\``);
        await queryRunner.query(`DROP INDEX \`IDX_e43efbfa3b850160b5b2c50e3e\` ON \`conversation_participants\``);
        await queryRunner.query(`DROP TABLE \`conversation_participants\``);
        await queryRunner.query(`DROP TABLE \`conversations\``);
        await queryRunner.query(`DROP INDEX \`REL_c654135d06f3521e55c782000e\` ON \`conversation_histories\``);
        await queryRunner.query(`DROP INDEX \`IDX_cb22608d877217ad62617a1de8\` ON \`conversation_histories\``);
        await queryRunner.query(`DROP TABLE \`conversation_histories\``);
        await queryRunner.query(`DROP INDEX \`IDX_e5663ce0c730b2de83445e2fd1\` ON \`messages\``);
        await queryRunner.query(`DROP TABLE \`messages\``);
        await queryRunner.query(`DROP INDEX \`IDX_59dd2eb9657917760f47da230d\` ON \`emotion_messages\``);
        await queryRunner.query(`DROP TABLE \`emotion_messages\``);
    }

}
