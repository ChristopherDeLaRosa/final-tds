import axiosInstance from "./axiosConfig";

const URL = "/auth";

const crearUsuario = async (user) => {
  // user debe traer:
  // { nombreUsuario, email, rol, estudianteId?, docenteId? }

  const payload = {
    nombreUsuario: user.nombreUsuario,
    email: user.email,
    rol: user.rol,
    estudianteId: user.estudianteId || null,
    docenteId: user.docenteId || null,
  };

  const { data } = await axiosInstance.post(`${URL}/register`, payload);
  return data;
};

const verificarUsuario = async (username) => {
  const { data } = await axiosInstance.get(`${URL}/check-username/${username}`);
  return data.exists;
};

const verificarEmail = async (email) => {
  const { data } = await axiosInstance.get(`${URL}/check-email/${email}`);
  return data.exists;
};

export default {
  crearUsuario,
  verificarUsuario,
  verificarEmail,
};
