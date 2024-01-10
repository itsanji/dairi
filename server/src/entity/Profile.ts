import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column } from "typeorm";
@Entity()
export class Profile {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)"
    })
    updatedAt: Date;

    // @OneToOne(() => User, (user) => user.profile) // specify inverse side as a second parameter
    // user: User;
}
