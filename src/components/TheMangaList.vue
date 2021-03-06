<template lang="pug">
  #mangaTable
    el-table(
      ref="mangaListTable"
      :data="entries"
      v-loading='tagsLoading'
      @selection-change="handleSelectionChange"
    )
      template(slot='empty')
        span.mt-2.leading-normal
          template(v-if='entries.length || tagsLoading')
            | No entries found.
            | Try changing your filters
          template(v-else)
            | You haven't imported manga yet. Add a new manga series by pressing
            | Add Manga and providing a URL. Or press Import, to import your
            | manga from TrackrMoe or MangaDex
      el-table-column(type="selection" width="35")
      el-table-column(
        prop="newReleases"
        width="30"
        align="center"
        label-class-name="p-0"
      )
        template(slot-scope="scope")
          .new-chapter-dot(v-if="scope.row.attributes.unread")
      el-table-column(
        prop="attributes.title"
        label="Title"
        width="400"
      )
        template(slot-scope="scope")
          el-link.break-normal(
            :href="scope.row.links.series_url"
            :underline="false"
            target="_blank"
          )
            | {{ scope.row.attributes.title | sanitize }}
            .font-normal.text-sm.leading-5.text-gray-500(
              v-if="scope.row.attributes.tracked_entries.length > 1"
            )
              | {{ scope.row.attributes.tracked_entries.length }} sites tracked
      el-table-column(
        prop="attributes.status"
        label="Status"
        width="150"
        align="center"
      )
        template(slot-scope="scope")
          base-badge(
            :text="entryStatusName(scope.row)"
            :type="entryType(scope.row)"
          )
      el-table-column(
        prop="attributes.last_chapter_read"
        label="Last Read"
        align="center"
      )
        template(v-if='scope.row.attributes' slot-scope="scope")
          el-link.break-normal(
            v-if="scope.row.links.last_chapter_read_url"
            :href="scope.row.links.last_chapter_read_url"
            :underline="false"
            target="_blank"
          )
            | {{ chapterInfo(scope.row.attributes.last_volume_read, scope.row.attributes.last_chapter_read) }}
          template(v-else)
            | {{ chapterInfo(scope.row.attributes.last_volume_read, scope.row.attributes.last_chapter_read) }}
      el-table-column(
        prop="links.last_chapter_available_url"
        label="Last Available"
        align="center"
      )
        template(v-if='scope.row.attributes' slot-scope="scope")
          el-link(
            v-if="scope.row.links.last_chapter_available_url"
            :href="scope.row.links.last_chapter_available_url"
            :underline="false"
            target="_blank"
          )
            | {{ chapterInfo(scope.row.attributes.last_volume_available, scope.row.attributes.last_chapter_available) }}
          template(v-else)
            | No chapters
      el-table-column(
        prop="attributes.last_released_at"
        label="Released"
        align="center"
      )
        template(v-if='scope.row.attributes' slot-scope="scope")
          template(v-if='scope.row.attributes.last_released_at')
            | {{ scope.row.attributes.last_released_at | timeAgo }}
          template(v-else)
            | Unknown
      el-table-column(width="100" class-name="actions")
        template(slot-scope="scope")
          el-button(
            ref="editEntryButton"
            content="Edit"
            icon="el-icon-edit-outline"
            size="mini"
            @click="editMangaEntry(scope.row)"
            circle
            v-tippy
          )
          el-button(
            content="Set last read to the latest chapter"
            v-if="scope.row.attributes.unread"
            ref="updateEntryButton"
            icon="el-icon-check"
            size="mini"
            @click="setLastRead(scope.row)"
            :loading="entryUpdated === scope.row"
            circle
            v-tippy
          )
    .flex.flex-row.justify-center(v-if="entries.length > 0")
      el-pagination(
        layout="prev, pager, next"
        :page-size="50"
        :current-page.sync="entriesPagy.page"
        :total="entriesPagy.count"
        :hide-on-single-page="true"
        @current-change="$emit('changePage', $event)"
      )
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import {
    Table, TableColumn, Link, Button, Message, Pagination,
  } from 'element-ui';
  import dayjs from 'dayjs';
  import he from 'he';
  import relativeTime from 'dayjs/plugin/relativeTime';

  import { updateMangaEntry } from '@/services/api';

  dayjs.extend(relativeTime);

  export default {
    components: {
      'el-table': Table,
      'el-table-column': TableColumn,
      'el-link': Link,
      'el-button': Button,
      'el-pagination': Pagination,
    },
    filters: {
      sanitize(title) {
        return he.decode(title);
      },
      timeAgo(datetime) {
        return dayjs().to(dayjs(datetime));
      },
    },
    data() {
      return {
        entryUpdated: null,
      };
    },
    computed: {
      ...mapState('lists', [
        'entries',
        'entriesPagy',
        'statuses',
        'tagsLoading',
      ]),
    },
    methods: {
      ...mapMutations('lists', [
        'updateEntry',
      ]),
      entryStatusName(e) {
        return this.statuses.find((s) => s.enum === e.attributes.status).name;
      },
      entryType(entry) {
        const { status } = entry.attributes;

        return {
          1: 'success', 2: 'warning', 3: 'warning-light', 5: 'danger',
        }[status];
      },
      chapterInfo(volume, chapter) {
        if (chapter) {
          const chapterNumber = parseFloat(chapter);

          if (volume && volume !== '0') { return `Vol. ${volume} Ch. ${chapter}`; }

          // TODO: Replace when we return titles separately from the chapter
          if (Number.isNaN(chapterNumber)) return chapter;

          return `Ch. ${chapter}`;
        }

        return '';
      },
      async setLastRead(entry) {
        this.entryUpdated = entry;

        const attributes = {
          last_volume_read: entry.attributes.last_volume_available,
          last_chapter_read: entry.attributes.last_chapter_available,
          last_chapter_read_url: entry.links.last_chapter_available_url,
        };

        const response = await updateMangaEntry(entry.id, attributes);
        if (response) {
          const lastRead = this.chapterInfo(
            attributes.last_volume_read, attributes.last_chapter_read,
          );

          Message.info(`Updated last read to ${lastRead}`);
          this.updateEntry(response);
        } else {
          Message.error("Couldn't update. Try refreshing the page");
        }

        this.entryUpdated = null;
      },
      handleSelectionChange(entries) {
        this.$emit('seriesSelected', entries);
      },
      editMangaEntry(entry) {
        this.$emit('editEntry', entry);
      },
    },
  };
</script>

<style media="screen" lang="scss">
  .el-pagination {
    width: fit-content;
    @apply my-5 p-0 shadow overflow-hidden;

    @screen sm {
      @apply rounded-md;
    }
  }
  .btn-prev {
    @apply rounded-l;
  }
  .btn-next {
    @apply rounded-r;
  }
  .actions > .cell {
    opacity: 0;
    transition: 0.2s ease-in-out;
    @apply float-right;
    height: 28px; // matches the button height
  }
  tr:hover .actions > .cell {
    opacity: 1;
  }
  .new-chapter-dot {
    background-color: #409EFF;
    @apply h-2 w-2 p-0 rounded-full;
  }

  .el-checkbox__inner {
    @apply delay-0;
  }

  .el-table {
    box-shadow: 0 4px 8px rgba(0, 0, 0, .12);

    @screen sm {
      @apply rounded-md;
    }
  }

  .el-table th {
    @apply border-b border-gray-200 text-xs leading-4 font-medium text-gray-500;
    @apply uppercase tracking-wider;
  }
  .el-table th > .cell {
    @apply break-normal;
  }

  .el-table td > .cell {
    @apply break-normal;
  }
  .el-table--enable-row-hover .el-table__body tr:hover>td {
    @apply bg-gray-50;
  }

  .el-table__empty-text {
    @apply leading-loose my-5;
  }
</style>
