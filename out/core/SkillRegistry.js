"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedSkillRegistry = void 0;
const events_1 = require("events");
class EnhancedSkillRegistry {
    constructor() {
        this.skills = new Map();
        this.events = new events_1.EventEmitter();
    }
    registerSkill(skill) {
        if (this.skills.has(skill.metadata.name)) {
            throw new Error(`Skill ${skill.metadata.name} is already registered`);
        }
        // Validate skill dependencies
        if (skill.metadata.dependencies) {
            for (const dep of skill.metadata.dependencies) {
                if (!this.skills.has(dep)) {
                    throw new Error(`Missing dependency: ${dep} for skill ${skill.metadata.name}`);
                }
            }
        }
        this.skills.set(skill.metadata.name, skill);
        this.events.emit('skillRegistered', skill.metadata.name);
    }
    executeSkill(name, params, context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.getSkill(name);
            if (!skill) {
                throw new Error(`Skill ${name} not found`);
            }
            // Validate parameters
            if (skill.validate) {
                const validation = skill.validate(params);
                if (!validation.valid) {
                    return {
                        success: false,
                        output: null,
                        error: `Validation failed: ${(_a = validation.errors) === null || _a === void 0 ? void 0 : _a.join(', ')}`
                    };
                }
            }
            // Execute with timeout if specified
            if (skill.timeout) {
                return Promise.race([
                    skill.execute(params, context),
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`Skill timeout after ${skill.timeout}ms`)), skill.timeout))
                ]);
            }
            return skill.execute(params, context);
        });
    }
    getSkill(name) {
        return this.skills.get(name);
    }
    listSkills() {
        return Array.from(this.skills.keys());
    }
    getSkillVersion(name) {
        var _a;
        return (_a = this.skills.get(name)) === null || _a === void 0 ? void 0 : _a.metadata.version;
    }
    onSkillRegistered(callback) {
        this.events.on('skillRegistered', callback);
    }
}
exports.EnhancedSkillRegistry = EnhancedSkillRegistry;
//# sourceMappingURL=SkillRegistry.js.map