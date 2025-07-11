@@ .. @@
     async loadPreviewData() {
         try {
             // Load jobs data
             const jobs = await window.apiService.getPublicJobs();
-            this.renderJobs(jobs.slice(0, 6)); // Show only first 6 jobs
+            if (jobs && Array.isArray(jobs)) {
+                this.renderJobs(jobs.slice(0, 6)); // Show only first 6 jobs
+                // Update search functionality
+                this.setupJobSearch(jobs);
+            } else {
+                throw new Error('Invalid jobs data received');
+            }
             
-            // Update search functionality
-            this.setupJobSearch(jobs);
+            // Load and update stats
+            try {
+                const stats = await window.apiService.getPublicStats();
+                if (stats) {
+                    this.updateStats(stats);
+                }
+            } catch (statsError) {
+                console.warn('Failed to load stats:', statsError);
+            }
             
         } catch (error) {
             console.error('Failed to load preview data:', error);
             // Show fallback data
             this.renderFallbackJobs();
         }
+    }
+
+    updateStats(stats) {
+        const totalJobsEl = document.getElementById('total-jobs');
+        const totalCompaniesEl = document.getElementById('total-companies');
+        const totalCandidatesEl = document.getElementById('total-candidates');
+
+        if (totalJobsEl) totalJobsEl.textContent = `${stats.totalJobs}+`;
+        if (totalCompaniesEl) totalCompaniesEl.textContent = `${stats.totalCompanies}+`;
+        if (totalCandidatesEl) totalCandidatesEl.textContent = `${stats.totalCandidates}+`;
     }