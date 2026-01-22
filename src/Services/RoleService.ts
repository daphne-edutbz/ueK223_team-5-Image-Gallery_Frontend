import api from "../config/Api";

/**
 * Service für Rollen-bezogene API-Aufrufe
 */
const RoleService = {
  /**
   * Holt alle verfügbaren Rollen vom Backend
   * @returns Liste aller Rollen
   */
  findAll: () => api.get("/roles"),
};

export default RoleService;
