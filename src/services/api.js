import { secure } from '@/modules/axios';

export const create = (seriesURL, status, sourceID) => secure
  .post('/api/v1/manga_entries/', {
    manga_entry: { series_url: seriesURL, status, manga_source_id: sourceID },
  })
  .then((response) => response)
  .catch((request) => request.response);

export const updateMangaEntry = (id, attributes) => secure
  .put(`/api/v1/manga_entries/${id}`, { manga_entry: attributes })
  .then((response) => {
    if (response.data.error) { return false; }

    return response.data.data;
  })
  .catch((_error) => false);

export const bulkUpdateMangaEntry = (ids, attributes) => secure
  .put('/api/v1/manga_entries/bulk_update', { ids, manga_entry: attributes })
  .then((response) => {
    if (response.data.error) { return false; }

    return response.data.data;
  })
  .catch((_error) => false);

export const bulkDeleteMangaEntries = (seriesIDs) => secure
  .delete('/api/v1/manga_entries/bulk_destroy', { data: { ids: seriesIDs } })
  .then(() => true)
  .catch(() => false);
