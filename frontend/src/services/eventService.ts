import api from './api';
import type { RoadEvent } from '../types';

export const getEvents = async (params?: Record<string, string>) => {
  const { data } = await api.get<RoadEvent[]>('/events', { params });
  return data;
};

export const getEventById = async (id: string) => {
  const { data } = await api.get<RoadEvent>(`/events/${id}`);
  return data;
};

export const createEvent = async (eventData: Partial<RoadEvent>) => {
  const { data } = await api.post<RoadEvent>('/events', eventData);
  return data;
};

export const updateEvent = async (id: string, eventData: Partial<RoadEvent>) => {
  const { data } = await api.patch<RoadEvent>(`/events/${id}`, eventData);
  return data;
};

export const getEventsGeoJSON = async (params?: Record<string, string>) => {
  const { data } = await api.get('/exports/geojson', { params });
  return data;
};
