import api from "../config/Api";
import { User } from "../types/models/User.model";

/**
 * Service für alle User-bezogenen API-Aufrufe
 */
const UserService = {
  /**
   * Holt einen User anhand der ID
   * @param userID - User ID
   * @returns User-Objekt
   */
  getUser: async (userID: string): Promise<User> => {
    const { data } = await api.get<User>(`/user/${userID}`);
    return data;
  },

  /**
   * Aktualisiert einen bestehenden User
   * @param user - User-Objekt mit aktualiserten Daten
   */
  updateUser: (user: User) => {
    return api.put(`/user/${user.id}`, user);
  },

  /**
   * Registriert einen neuen User
   * @param user - User-Daten für Registrierung
   * @returns Erstellter User
   */
  addUser: (user: User) => {
    return api.post("/user/registerUser", user).then((res) => {
      return res.data;
    });
  },

  /**
   * Holt alle User
   * @returns Liste aller User
   */
  getAllUsers: () => {
    return api.get(`/user`);
  },

  /**
   * Löscht einen User
   * @param id - User ID
   */
  deleteUser: (id: string) => {
    return api.delete(`/user/${id}`);
  },
};

export default UserService;
