import { ControlsRepository } from '../repositories/controls.repository';
import { v4 as uuidv4 } from 'uuid';

export class ControlsService {
    private repository: ControlsRepository;

    constructor(database?: any) {
        this.repository = new ControlsRepository(database);
    }

    //Crea un control con una ID, un codigo de control, titulo. Opcional: desc, status y asignar 
    async createControl(data: {
        standardId: string;
        code: string;
        title: string;
        description?: string;
        status?: string;
        assignedTo?: string;
    }) {
        const id = uuidv4();
        return await this.repository.create({
            id,
            ...data,
        });
    }

    async getControl(id: string) {
        return await this.repository.findById(id);
    }

    async getControlsByStandard(standardId: string) {
        return await this.repository.findByStandardId(standardId);
    }

    async getAllControls() {
        return await this.repository.findAll();
    }

    async updateControl(id: string, data: {
        code?: string;
        title?: string;
        description?: string;
        status?: string;
        assignedTo?: string;
    }) {
        return await this.repository.update(id, data);
    }

    async deleteControl(id: string) {
        await this.repository.delete(id);
    }
}
