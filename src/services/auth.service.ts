import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import RegistrationDTO from '../payloads/dto/register.dto';
import LoginDTO from '../payloads/dto/login.dto';
import { User } from '../interfaces/user.interface';
import ResponseObject from '../interfaces/response.interface';
import AuthenticationResponseObject from '../payloads/response/authResponseObject.vm';
import { SECRET_KEY } from "../config/env"

export class AuthService {
    
    
    private static users: User[] = []; // Un tableau pour stocker des utilisateurs fictifs
    private static idCount : number = 0;
    
    static async register(registrationDto: RegistrationDTO) : Promise<AuthenticationResponseObject> {
        try {
            this.users.push({ 
                username: registrationDto.username , 
                password: await bcrypt.hash(registrationDto.password.trim(), 10),
                id: this.idCount++,
                name: registrationDto.name
            });
            const token = jwt.sign({ username: registrationDto.username }, SECRET_KEY, { expiresIn: '1h' });
            return {
                code: 200,
                jwt: token,
                message: "Successfully Registererd."
            }
        } catch (e) {
            return {
                code: 400,
                jwt: "",
                message: e as any,
            };
        }
    }

    static async authenticate(loginDto: LoginDTO) : Promise<AuthenticationResponseObject> {
        const user = this.users.find(u => u.username === loginDto.username.trim());

        if (!user) {
            return {code : 400, message: 'Utilisateur non trouvé', jwt:""}
        }
        
        const isValidPassword = await bcrypt.compare(loginDto.password.trim(), user.password);
        if (!isValidPassword) {
            return {code : 400, message: 'Mot de passe incorrect', jwt: ""}
        }
    
        // Génération d'un JWT
        const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY ?? "", { expiresIn: '1h' });
        return {
            code: 200,
            message: "Logged in Successfully",
            jwt: token,
        }
    }
}